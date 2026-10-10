import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../lib/admin.middleware.js";

export const adminAuditRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: requireAdmin }, async (request, reply) => {
    const q = request.query as { actorId?: string; action?: string; limit?: string };
    const limit = Math.min(parseInt(q.limit ?? "100", 10) || 100, 500);

    const where: Record<string, unknown> = {};
    if (q.actorId) where.actorId = q.actorId;
    if (q.action) where.action = { contains: q.action };

    const items = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return reply.send({ items });
  });
};