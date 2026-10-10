import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { registerRoutes } from "./routes/index.js";

const app = Fastify({ logger, trustProxy: true, bodyLimit: 1_048_576 });

await app.register(cors, {
  origin: [env.FRONTEND_URL, "http://localhost:3001"],
  credentials: true,
});
await app.register(cookie);

app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

await app.register(registerRoutes);

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down...`);
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info(`Server listening on http://${env.HOST}:${env.PORT}`);
} catch (err) {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
}