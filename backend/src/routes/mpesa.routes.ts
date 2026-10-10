import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { etimsQueue } from "../queues/etims.queue.js";
import { mpesaService } from "../services/mpesa.service.js";
import { requireAuth } from "../lib/auth.middleware.js";
import type { StkPushCallbackBody, ParsedCallback } from "../types/mpesa.js";

const stkPushSchema = z.object({
  phoneNumber: z.string().regex(/^254\d{9}$/, "Phone must be 2547XXXXXXXX"),
  amount: z.number().positive().max(150_000),
  accountReference: z.string().min(1).max(12),
  transactionDesc: z.string().min(1).max(13),
});

function parseCallback(body: StkPushCallbackBody): ParsedCallback {
  const cb = body.Body.stkCallback;
  const parsed: ParsedCallback = {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
  };
  if (cb.CallbackMetadata?.Item) {
    for (const item of cb.CallbackMetadata.Item) {
      if (item.Name === "Amount") parsed.amount = Number(item.Value);
      if (item.Name === "MpesaReceiptNumber") parsed.mpesaReceiptNumber = String(item.Value);
      if (item.Name === "TransactionDate") parsed.transactionDate = String(item.Value);
      if (item.Name === "PhoneNumber") parsed.phoneNumber = String(item.Value);
    }
  }
  return parsed;
}

export const mpesaRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- STK Push (authenticated, tenant-scoped) --------
  fastify.post("/stkpush", { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const parsed = stkPushSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: auth.tenantId } });
    if (!tenant) return reply.code(404).send({ error: "Tenant not found" });

    try {
      const result = await mpesaService.stkPush(parsed.data, { tenant });
      return reply.send({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ tenantId: auth.tenantId, err: message }, "STK Push failed");
      return reply.code(502).send({ success: false, error: message });
    }
  });

  // -------- Callback (public, scoped by shortcode -> tenant) --------
  fastify.post("/callback", async (request, reply) => {
    const started = Date.now();
    try {
      const body = request.body as StkPushCallbackBody;
      if (!body?.Body?.stkCallback) {
        logger.warn({ body }, "Malformed M-Pesa callback");
        return reply.send({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      const parsed = parseCallback(body);
      const isSuccess = parsed.resultCode === 0;

      // Resolve tenant: for a real deployment, look up by BusinessShortCode from the callback.
      // In sandbox/single-tenant dev, fall back to the first tenant that has M-Pesa configured.
      const shortcodeFromCallback = (body as unknown as { BusinessShortCode?: string }).BusinessShortCode;
      const tenant = shortcodeFromCallback
        ? await prisma.tenant.findFirst({ where: { mpesaShortcode: shortcodeFromCallback } })
        : await prisma.tenant.findFirst({ where: { mpesaConnectedAt: { not: null } } });

      if (!tenant) {
        logger.warn({ shortcodeFromCallback }, "Callback: no tenant matched");
        return reply.send({ ResultCode: 0, ResultDesc: "Accepted" });
      }

      const transaction = await prisma.transaction.upsert({
        where: { checkoutRequestId: parsed.checkoutRequestId },
        create: {
          tenantId: tenant.id,
          checkoutRequestId: parsed.checkoutRequestId,
          merchantRequestId: parsed.merchantRequestId,
          mpesaReceiptNumber: parsed.mpesaReceiptNumber ?? null,
          amount: parsed.amount ?? 0,
          phoneNumber: parsed.phoneNumber ?? "unknown",
          status: isSuccess ? "SUCCESS" : "FAILED",
          rawCallbackData: body as unknown as object,
        },
        update: {
          status: isSuccess ? "SUCCESS" : "FAILED",
          mpesaReceiptNumber: parsed.mpesaReceiptNumber ?? undefined,
          rawCallbackData: body as unknown as object,
        },
      });

      if (isSuccess) {
        await prisma.invoice.upsert({
          where: { transactionId: transaction.id },
          create: { tenantId: tenant.id, transactionId: transaction.id, status: "QUEUED" },
          update: {},
        });

        await etimsQueue.add(
          "submit-invoice",
          { transactionId: transaction.id, tenantId: tenant.id },
          { jobId: `txn-${transaction.id}` }
        );

        logger.info({ tenantId: tenant.id, transactionId: transaction.id }, "Enqueued eTIMS job");
      }

      logger.info(
        { tenantId: tenant.id, checkoutRequestId: parsed.checkoutRequestId, ms: Date.now() - started },
        "Callback processed"
      );

      return reply.send({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (err) {
      logger.error({ err }, "Callback processing error");
      return reply.send({ ResultCode: 0, ResultDesc: "Accepted" });
    }
  });
};