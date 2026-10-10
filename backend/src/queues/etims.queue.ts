import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";

export const ETIMS_QUEUE_NAME = "etims-invoice-queue";

export const etimsQueue = new Queue(ETIMS_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 1000 },
  },
});

export interface EtimsJobData {
  transactionId: string;
}