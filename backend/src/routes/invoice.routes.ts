import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.middleware.js";
import { etimsQueue } from "../queues/etims.queue.js";

export const invoiceRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- List invoices (tenant-scoped) --------
  fastify.get("/", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const q = request.query as { status?: string; limit?: string; cursor?: string };
    const limit = Math.min(parseInt(q.limit ?? "50", 10) || 50, 200);

    const where: Record<string, unknown> = { tenantId: auth.tenantId };
    if (q.status) where.status = q.status;

    const items = await prisma.invoice.findMany({
      where,
      include: { transaction: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(q.cursor ? { skip: 1, cursor: { id: q.cursor } } : {}),
    });

    return reply.send({ items, nextCursor: items.length === limit ? items[items.length - 1].id : null });
  });

  // -------- Get one --------
  fastify.get("/:id", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const { id } = request.params as { id: string };
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId: auth.tenantId },
      include: { transaction: true },
    });
    if (!invoice) return reply.code(404).send({ error: "Not found" });
    return reply.send(invoice);
  });

  // -------- Retry a failed invoice --------
  fastify.post("/:id/retry", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const { id } = request.params as { id: string };
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId: auth.tenantId },
    });
    if (!invoice) return reply.code(404).send({ error: "Not found" });
    if (invoice.status === "SUBMITTED") return reply.code(400).send({ error: "Already submitted" });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "QUEUED", errorMessage: null },
    });

    await etimsQueue.add(
      "submit-invoice",
      { transactionId: invoice.transactionId, tenantId: auth.tenantId },
      { jobId: `txn-${invoice.transactionId}-retry-${Date.now()}` }
    );

    return reply.send({ ok: true });
  });

  // -------- Stats --------
  fastify.get("/stats/summary", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const [total, submitted, failed, queued] = await Promise.all([
      prisma.invoice.count({ where: { tenantId: auth.tenantId } }),
      prisma.invoice.count({ where: { tenantId: auth.tenantId, status: "SUBMITTED" } }),
      prisma.invoice.count({ where: { tenantId: auth.tenantId, status: "FAILED" } }),
      prisma.invoice.count({ where: { tenantId: auth.tenantId, status: "QUEUED" } }),
    ]);

    const agg = await prisma.transaction.aggregate({
      where: { tenantId: auth.tenantId, status: "SUCCESS" },
      _sum: { amount: true },
      _count: true,
    });

    return reply.send({
      invoices: { total, submitted, failed, queued },
      transactions: {
        successCount: agg._count,
        successAmount: Number(agg._sum.amount ?? 0),
      },
    });
  });
};