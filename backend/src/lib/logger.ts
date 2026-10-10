import pino from "pino";
import { env } from "./env.js";
import { logBus } from "./log-bus.js";

const isProd = process.env.NODE_ENV === "production";

const busStream = {
  write(line: string) {
    try {
      const obj = JSON.parse(line);
      const built = buildEntrySafe(obj);
      if (built) logBus.push(built);
    } catch {
      // ignore
    }
  },
};

function buildEntrySafe(obj: Record<string, unknown>) {
  if (typeof obj?.level !== "number") return null;
  const map: Record<number, "trace" | "debug" | "info" | "warn" | "error" | "fatal"> = {
    10: "trace", 20: "debug", 30: "info", 40: "warn", 50: "error", 60: "fatal",
  };
  const level = obj.level as number;
  const levelLabel = map[level] ?? "info";
  const ctx: Record<string, unknown> = {};
  let source: string | undefined;
  for (const [k, v] of Object.entries(obj)) {
    if (["level", "time", "msg", "pid", "hostname", "id"].includes(k)) continue;
    ctx[k] = v;
    if (k === "source" || k === "module") source = String(v);
  }
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date(Number(obj.time) || Date.now()).toISOString(),
    level,
    levelLabel,
    msg: String(obj.msg ?? ""),
    source,
    context: Object.keys(ctx).length ? ctx : undefined,
  };
}

export const logger = pino(
  { level: env.LOG_LEVEL },
  pino.multistream([
    { stream: busStream },
    isProd
      ? { stream: process.stdout }
      : { stream: pino.transport({ target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }) },
  ])
);