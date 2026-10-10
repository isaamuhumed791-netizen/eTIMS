import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import axios from "axios";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.middleware.js";
import { encrypt, maskSecret } from "../lib/crypto.js";
import { etimsService } from "../services/etims.service.js";
import { mpesaService } from "../services/mpesa.service.js";
import { logger } from "../lib/logger.js";

const etimsConnectSchema = z.object({
  tin: z.string().min(3).max(20),
  bhfId: z.string().min(1).max(10).default("00"),
  dvcSrlNo: z.string().min(1).max(40),
  baseUrl: z.string().url().optional(),
});

const mpesaConnectSchema = z.object({
  consumerKey: z.string().min(4),
  consumerSecret: z.string().min(4),
  passkey: z.string().min(4),
  shortcode: z.string().min(3).max(10),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
});

export const tenantRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- Verify KRA PIN (public lookup helper) --------
  fastify.post("/verify-pin", { preHandler: requireAuth }, async (request, reply) => {
    const body = request.body as { tin?: string };
    if (!body?.tin) return reply.code(400).send({ error: "tin required" });

    // KRA exposes a public PIN checker; if unavailable, return a soft response
    try {
      const { data } = await axios.get(
        `https://itax.kra.go.ke/KRA-Portal/pinChecker.htm`,
        { params: { actionCode: "verifyPin", pinNo: body.tin }, timeout: 10_000 }
      );
      return reply.send({ tin: body.tin, raw: data });
    } catch (err) {
      logger.warn({ err }, "PIN verify lookup failed — returning soft ok");
      return reply.send({ tin: body.tin, warning: "PIN lookup unavailable; proceed to connect to verify" });
    }
  });

  // -------- Connect eTIMS --------
  fastify.post("/etims/connect", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const parsed = etimsConnectSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });

    try {
      const result = await etimsService.initializeDeviceForTenant(auth.tenantId, parsed.data);
      return reply.send({
        ok: true,
        sdcId: result.sdcId,
        cmcKeyPreview: maskSecret(result.cmcKey),
        connectedAt: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ tenantId: auth.tenantId, err: message }, "eTIMS connect failed");
      return reply.code(400).send({ ok: false, error: message });
    }
  });

  // -------- Connect M-Pesa --------
  fastify.post("/mpesa/connect", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const parsed = mpesaConnectSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });

    const { consumerKey, consumerSecret, passkey, shortcode, environment } = parsed.data;

    try {
      // Validate creds with a real OAuth call before saving
      await mpesaService.testCredentials(consumerKey, consumerSecret, environment);

      await prisma.tenant.update({
        where: { id: auth.tenantId },
        data: {
          mpesaConsumerKeyEnc: encrypt(consumerKey),
          mpesaConsumerSecretEnc: encrypt(consumerSecret),
          mpesaPasskeyEnc: encrypt(passkey),
          mpesaShortcode: shortcode,
          mpesaEnv: environment,
          mpesaConnectedAt: new Date(),
        },
      });

      return reply.send({ ok: true, shortcode, environment, connectedAt: new Date().toISOString() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ tenantId: auth.tenantId, err: message }, "M-Pesa connect failed");
      return reply.code(400).send({ ok: false, error: "Could not validate M-Pesa credentials. " + message });
    }
  });

  // -------- Get current status --------
  fastify.get("/status", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const t = await prisma.tenant.findUnique({ where: { id: auth.tenantId } });
    if (!t) return reply.code(404).send({ error: "Tenant not found" });

    return reply.send({
      tenant: { id: t.id, name: t.name, slug: t.slug, email: t.email },
      etims: {
        connected: Boolean(t.etimsConnectedAt),
        tin: t.tin,
        bhfId: t.bhfId,
        dvcSrlNo: t.dvcSrlNo,
        connectedAt: t.etimsConnectedAt,
        cmcKeyPreview: t.cmcKeyEnc ? "••••" : null,
      },
      mpesa: {
        connected: Boolean(t.mpesaConnectedAt),
        shortcode: t.mpesaShortcode,
        environment: t.mpesaEnv,
        connectedAt: t.mpesaConnectedAt,
        consumerKeyPreview: t.mpesaConsumerKeyEnc ? "••••" : null,
      },
    });
  });

  // -------- Disconnect endpoints --------
  fastify.post("/etims/disconnect", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    await prisma.tenant.update({
      where: { id: auth.tenantId },
      data: { cmcKeyEnc: null, etimsConnectedAt: null, tin: null, bhfId: null, dvcSrlNo: null },
    });
    return reply.send({ ok: true });
  });

  fastify.post("/mpesa/disconnect", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    await prisma.tenant.update({
      where: { id: auth.tenantId },
      data: {
        mpesaConsumerKeyEnc: null,
        mpesaConsumerSecretEnc: null,
        mpesaPasskeyEnc: null,
        mpesaShortcode: null,
        mpesaConnectedAt: null,
      },
    });
    return reply.send({ ok: true });
  });
};