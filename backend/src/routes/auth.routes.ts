import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "../lib/jwt.js";
import { requireAuth } from "../lib/auth.middleware.js";
import { logger } from "../lib/logger.js";

const signupSchema = z.object({
  fullName: z.string().min(2).max(80),
  businessName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function slugify(input: string): string {
  const base = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return base || "tenant";
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/signup", async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    const { fullName, businessName, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    let slug = slugify(businessName);
    let suffix = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${slugify(businessName)}-${suffix++}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: businessName, slug, email, phone },
      });
      const user = await tx.user.create({
        data: { tenantId: tenant.id, email, passwordHash, fullName, role: "OWNER" },
      });
      return { tenant, user };
    });

    const token = signToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      role: result.user.role,
    });

    reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    logger.info({ tenantId: result.tenant.id }, "New tenant signed up");

    return reply.code(201).send({
      user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName, role: result.user.role },
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
    });
  });

  fastify.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Validation failed" });
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) return reply.code(401).send({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return reply.send({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    });
  });

  fastify.post("/logout", async (_request, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return reply.send({ ok: true });
  });

  fastify.get("/me", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { tenant: true },
    });
    if (!user) return reply.code(404).send({ error: "User not found" });

    return reply.send({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        tin: user.tenant.tin,
        bhfId: user.tenant.bhfId,
        dvcSrlNo: user.tenant.dvcSrlNo,
        etimsConnectedAt: user.tenant.etimsConnectedAt,
        mpesaShortcode: user.tenant.mpesaShortcode,
        mpesaEnv: user.tenant.mpesaEnv,
        mpesaConnectedAt: user.tenant.mpesaConnectedAt,
      },
    });
  });
};