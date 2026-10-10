import type { FastifyPluginAsync } from "fastify";
import { requireAdmin } from "../../lib/admin.middleware.js";
import { etimsQueue, ETIMS_QUEUE_NAME } from "../../queues/etims.queue.js";
import { audit } from "../../lib/audit.js";

export const adminQueueRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/stats", { preHandler: requireAdmin }, async (_request, reply) => {
    const counts = await etimsQueue.getJobCounts(
      "waiting", "active", "completed", "failed", "delayed", "paused"
    );
    const completed = await etimsQueue.getCompleted(0, 9);
    const failed = await etimsQueue.getFailed(0, 9);

    return reply.send({
      queue: ETIMS_QUEUE_NAME,
      counts,
      recentCompleted: completed.map((j) => ({
        id: j.id,
        name: j.name,
        finishedOn: j.finishedOn,
        data: j.data,
      })),
      recentFailed: failed.map((j) => ({
        id: j.id,
        name: j.name,
        failedReason: j.failedReason,
        attemptsMade: j.attemptsMade,
        data: j.data,
      })),
    });
  });

  fastify.post("/retry-failed", { preHandler: requireAdmin }, async (request, reply) => {
    const failed = await etimsQueue.getFailed(0, 100);
    let retried = 0;
    for (const job of failed) {
      try {
        await job.retry();
        retried++;
      } catch {
        // ignore individual failures
      }
    }
    await audit({
      request,
      action: "queue.retry_failed",
      payload: { count: retried },
    });
    return reply.send({ ok: true, retried });
  });

  fastify.post("/drain", { preHandler: requireAdmin }, async (request, reply) => {
    await etimsQueue.drain();
    await audit({ request, action: "queue.drain" });
    return reply.send({ ok: true });
  });
};