import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "./prisma.js";
import { verifyToken, COOKIE_NAME } from "./jwt.js";
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

function extractToken(request: FastifyRequest): string | undefined {
  return (
    (request.cookies as Record<string, string> | undefined)?.[COOKIE_NAME] ||
    (request.headers.authorization?.startsWith("Bearer ")
      ? request.headers.authorization.slice(7)
      : undefined)
  );
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  // Ensure auth is populated even if requireAuth was not run first
  if (!request.auth) {
    const token = extractToken(request);
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    try {
      request.auth = verifyToken(token);
    } catch {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: request.auth.userId },
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