import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../lib/admin.middleware.js";
import { audit } from "../../lib/audit.js";

export const adminErrorsRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- List grouped errors --------
  fastify.get("/", { preHandler: requireAdmin }, async (request, reply) => {
    const q = request.query as { resolved?: string; source?: string; limit?: string };
    const limit = Math.min(parseInt(q.limit ?? "100", 10) || 100, 500);

    const where: Record<string, unknown> = {};
    if (q.resolved === "true") where.resolved = true;
    else if (q.resolved === "false") where.resolved = false;
    if (q.source) where.source = q.source;

    const items = await prisma.errorEvent.findMany({
      where,
      orderBy: { lastSeenAt: "desc" },
      take: limit,
    });

    return reply.send({ items });
  });

  // -------- Resolve --------
  fastify.post("/:id/resolve", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const admin = request.admin!;

    await prisma.errorEvent.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy: admin.email },
    });

    await audit({
      request,
      action: "error.resolve",
      targetType: "ErrorEvent",
      targetId: id,
    });

    return reply.send({ ok: true });
  });

  // -------- Unresolve --------
  fastify.post("/:id/unresolve", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.errorEvent.update({
      where: { id },
      data: { resolved: false, resolvedAt: null, resolvedBy: null },
    });

    await audit({
      request,
      action: "error.unresolve",
      targetType: "ErrorEvent",
      targetId: id,
    });

    return reply.send({ ok: true });
  });

  // -------- Delete --------
  fastify.delete("/:id", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.errorEvent.delete({ where: { id } });
    await audit({ request, action: "error.delete", targetType: "ErrorEvent", targetId: id });
    return reply.send({ ok: true });
  });
};