import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { etimsService } from "../services/etims.service.js";
import { ETIMS_QUEUE_NAME } from "../queues/etims.queue.js";

interface EtimsJobData {
  transactionId: string;
  tenantId: string;
}

const worker = new Worker<EtimsJobData>(
  ETIMS_QUEUE_NAME,
  async (job: Job<EtimsJobData>) => {
    const { transactionId, tenantId } = job.data;
    logger.info({ transactionId, tenantId, attempt: job.attemptsMade + 1 }, "Processing eTIMS job");

    const [transaction, tenant] = await Promise.all([
      prisma.transaction.findUnique({ where: { id: transactionId } }),
      prisma.tenant.findUnique({ where: { id: tenantId } }),
    ]);

    if (!transaction) throw new Error(`Transaction ${transactionId} not found`);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
    if (transaction.status !== "SUCCESS") {
      logger.warn({ transactionId }, "Skipping non-successful transaction");
      return { skipped: true };
    }
    if (!tenant.cmcKeyEnc) {
      logger.warn({ tenantId }, "Tenant has no eTIMS credentials — skipping");
      return { skipped: true };
    }

    await prisma.invoice.update({
      where: { transactionId },
      data: { retryCount: { increment: 1 }, status: "QUEUED" },
    });

    try {
      const result = await etimsService.submitSalesInvoice(tenant, transaction);

      await prisma.invoice.update({
        where: { transactionId },
        data: {
          status: "SUBMITTED",
          kraInvoiceNumber: result.kraInvoiceNumber,
          sdcId: result.sdcId,
          receiptSignature: result.receiptSignature,
          errorMessage: null,
        },
      });

      logger.info({ transactionId, tenantId, ...result }, "eTIMS invoice submitted");
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.invoice.update({
        where: { transactionId },
        data: { status: "FAILED", errorMessage: message },
      });
      logger.error({ transactionId, tenantId, err: message }, "eTIMS submission failed");
      throw err;
    }
  },
  { connection: redisConnection, concurrency: 5 }
);

worker.on("completed", (job) => logger.info({ jobId: job.id }, "Job completed"));
worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "Job failed"));
logger.info(`eTIMS worker listening on queue: ${ETIMS_QUEUE_NAME}`);

process.on("SIGINT", async () => { await worker.close(); process.exit(0); });
process.on("SIGTERM", async () => { await worker.close(); process.exit(0); });