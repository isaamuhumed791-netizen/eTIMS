import type { FastifyRequest } from "fastify";
import { prisma } from "./prisma.js";
import { logger } from "./logger.js";

interface AuditInput {
  request: FastifyRequest;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}

export async function audit({ request, action, targetType, targetId, payload }: AuditInput) {
  try {
    const admin = request.admin;
    await prisma.auditLog.create({
      data: {
        actorId: admin?.id ?? null,
        actorEmail: admin?.email ?? null,
        action,
        targetType: targetType ?? null,
        targetId: targetId ?? null,
        payload: (payload ?? {}) as object,
        ipAddress: request.ip ?? null,
      },
    });
  } catch (err) {
    logger.error({ err, action }, "Failed to write audit log");
  }
}