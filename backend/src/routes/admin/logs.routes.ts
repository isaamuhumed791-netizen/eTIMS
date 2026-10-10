import type { FastifyPluginAsync } from "fastify";
import { requireAdmin } from "../../lib/admin.middleware.js";
import { logBus, type LogEntry } from "../../lib/log-bus.js";

export const adminLogsRoutes: FastifyPluginAsync = async (fastify) => {
  // -------- Recent logs (for initial page load) --------
  fastify.get("/recent", { preHandler: requireAdmin }, async (request, reply) => {
    const q = request.query as { limit?: string; level?: string; source?: string };
    const limit = Math.min(parseInt(q.limit ?? "100", 10) || 100, 500);
    const items = logBus.recent(limit, { level: q.level, source: q.source });
    return reply.send({ items });
  });

  // -------- Live stream (SSE) --------
  fastify.get("/stream", { preHandler: requireAdmin }, async (request, reply) => {
    const q = request.query as { level?: string; source?: string };
    const minLevelNum = q.level ? levelToNumber(q.level) : 0;

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Send a comment immediately to open the stream in browsers
    reply.raw.write(": connected\n\n");

    // Send last 50 logs as catch-up
    const backlog = logBus.recent(50, { level: q.level, source: q.source });
    for (const entry of backlog) {
      writeSse(reply.raw, "log", entry);
    }

    // Stream live
    const unsubscribe = logBus.subscribe((entry: LogEntry) => {
      if (entry.level < minLevelNum) return;
      if (q.source && entry.source !== q.source) return;
      try {
        writeSse(reply.raw, "log", entry);
      } catch {
        // connection closed
      }
    });

    // Heartbeat to keep proxies from closing the connection
    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(": heartbeat\n\n");
      } catch {
        // ignore
      }
    }, 15_000);

    // Cleanup on client disconnect
    request.raw.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
      try { reply.raw.end(); } catch { /* ignore */ }
    });

    // Never resolve the handler — the response stays open
    return reply;
  });
};

function writeSse(stream: NodeJS.WritableStream, event: string, data: unknown) {
  stream.write(`event: ${event}\n`);
  stream.write(`data: ${JSON.stringify(data)}\n\n`);
}

function levelToNumber(label: string): number {
  const map: Record<string, number> = {
    trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60,
  };
  return map[label.toLowerCase()] ?? 0;
}