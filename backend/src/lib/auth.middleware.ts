import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken, COOKIE_NAME, type JwtPayload } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    auth?: JwtPayload;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token =
    (request.cookies as Record<string, string> | undefined)?.[COOKIE_NAME] ||
    (request.headers.authorization?.startsWith("Bearer ")
      ? request.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {
    request.auth = verifyToken(token);
  } catch {
    return reply.code(401).send({ error: "Invalid or expired token" });
  }
}