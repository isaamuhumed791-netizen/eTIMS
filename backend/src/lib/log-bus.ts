import { EventEmitter } from "node:events";

export interface LogEntry {
  id: string;
  ts: string;
  level: number;
  levelLabel: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  msg: string;
  source?: string;
  context?: Record<string, unknown>;
}

const LEVEL_LABELS: Record<number, LogEntry["levelLabel"]> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

class LogBus {
  private emitter = new EventEmitter();
  private buffer: LogEntry[] = [];
  private maxBuffer = 500;

  constructor() {
    this.emitter.setMaxListeners(200);
  }

  push(entry: LogEntry) {
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBuffer) this.buffer.shift();
    this.emitter.emit("log", entry);
  }

  subscribe(fn: (entry: LogEntry) => void): () => void {
    this.emitter.on("log", fn);
    return () => this.emitter.off("log", fn);
  }

  recent(limit = 100, opts?: { level?: string; source?: string }): LogEntry[] {
    let items = this.buffer.slice();
    if (opts?.level) {
      const minLevel = this.levelToNumber(opts.level);
      items = items.filter((e) => e.level >= minLevel);
    }
    if (opts?.source) {
      items = items.filter((e) => e.source === opts.source);
    }
    return items.slice(-limit);
  }

  private levelToNumber(label: string): number {
    const map: Record<string, number> = {
      trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60,
    };
    return map[label.toLowerCase()] ?? 0;
  }

  static buildEntry(obj: Record<string, unknown>): LogEntry | null {
    // pino emits objects like { level: 30, time: 169..., msg: "...", ... }
    if (typeof obj?.level !== "number") return null;
    const level = obj.level as number;
    const levelLabel = LEVEL_LABELS[level] ?? "info";

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
}

export const logBus = new LogBus();