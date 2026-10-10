import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "./prisma.js";
import { logger } from "./logger.js";

export const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminContext {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

declare module "fastify" {
  interface FastifyRequest {
    admin?: AdminContext;
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.auth;
  if (!auth) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, role: true, fullName: true },
  });

  if (!user) {
    return reply.code(401).send({ error: "User not found" });
  }

  if (!ADMIN_ROLES.includes(user.role as AdminRole)) {
    logger.warn({ userId: user.id, role: user.role }, "Non-admin attempted admin route");
    return reply.code(403).send({ error: "Forbidden: admin access required" });
  }

  request.admin = user;
}