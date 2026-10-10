import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../lib/admin.middleware.js";
import { audit } from "../../lib/audit.js";

export const adminTenantsRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- List tenants --------
  fastify.get("/", { preHandler: requireAdmin }, async (request, reply) => {
    const q = request.query as { search?: string; limit?: string };
    const limit = Math.min(parseInt(q.limit ?? "100", 10) || 100, 500);

    const where = q.search
      ? {
          OR: [
            { name: { contains: q.search, mode: "insensitive" as const } },
            { slug: { contains: q.search, mode: "insensitive" as const } },
            { email: { contains: q.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        tin: true,
        plan: true,
        planExpiresAt: true,
        etimsConnectedAt: true,
        mpesaConnectedAt: true,
        mpesaShortcode: true,
        createdAt: true,
        _count: { select: { transactions: true, invoices: true, users: true } },
      },
    });

    return reply.send({ items: tenants });
  });

  // -------- Get one tenant (full detail) --------
  fastify.get("/:id", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, email: true, fullName: true, role: true, createdAt: true } },
        _count: { select: { transactions: true, invoices: true, users: true, apiKeys: true } },
      },
    });
    if (!tenant) return reply.code(404).send({ error: "Tenant not found" });

    // Recent transactions (last 10)
    const recentTx = await prisma.transaction.findMany({
      where: { tenantId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        mpesaReceiptNumber: true,
        amount: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
      },
    });

    const invoiceStats = await prisma.invoice.groupBy({
      by: ["status"],
      where: { tenantId: id },
      _count: true,
    });

    return reply.send({
      tenant: {
        ...tenant,
        mpesaConsumerKeyEnc: undefined,
        mpesaConsumerSecretEnc: undefined,
        mpesaPasskeyEnc: undefined,
        cmcKeyEnc: undefined,
      },
      recentTransactions: recentTx,
      invoiceStats: Object.fromEntries(invoiceStats.map((s) => [s.status, s._count])),
    });
  });

  // -------- Suspend --------
  fastify.post("/:id/suspend", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return reply.code(404).send({ error: "Tenant not found" });

    await prisma.tenant.update({
      where: { id },
      data: { plan: "SUSPENDED" },
    });

    await audit({
      request,
      action: "tenant.suspend",
      targetType: "Tenant",
      targetId: id,
      payload: { tenantName: tenant.name, previousPlan: tenant.plan },
    });

    return reply.send({ ok: true });
  });

  // -------- Unsuspend --------
  fastify.post("/:id/unsuspend", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return reply.code(404).send({ error: "Tenant not found" });

    await prisma.tenant.update({
      where: { id },
      data: { plan: "FOUNDING" },
    });

    await audit({
      request,
      action: "tenant.unsuspend",
      targetType: "Tenant",
      targetId: id,
      payload: { tenantName: tenant.name },
    });

    return reply.send({ ok: true });
  });

  // -------- Set plan manually --------
  fastify.post("/:id/plan", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { plan, expiresAt } = request.body as { plan: string; expiresAt?: string | null };
    const allowed = ["FOUNDING", "TRIAL", "PRO", "SUSPENDED"];
    if (!allowed.includes(plan)) return reply.code(400).send({ error: "Invalid plan" });

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        plan,
        planExpiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await audit({
      request,
      action: "tenant.plan.update",
      targetType: "Tenant",
      targetId: id,
      payload: { plan, expiresAt },
    });

    return reply.send({ ok: true, plan: tenant.plan, planExpiresAt: tenant.planExpiresAt });
  });
};