"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  Terminal, Pause, Play, Trash2, Filter, Wifi, WifiOff,
} from "lucide-react";

interface LogEntry {
  id: string;
  ts: string;
  level: number;
  levelLabel: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  msg: string;
  source?: string;
  context?: Record<string, unknown>;
}

const LEVELS = ["all", "info", "warn", "error"] as const;
type LevelFilter = (typeof LEVELS)[number];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [connected, setConnected] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Load recent logs on mount
  useEffect(() => {
    api.get<{ items: LogEntry[] }>("/admin/logs/recent?limit=100")
      .then((r) => setLogs(r.data.items))
      .catch(() => {});
  }, []);

  // Subscribe to live SSE stream
  useEffect(() => {
    const es = new EventSource("/api/v1/admin/logs/stream", { withCredentials: true });

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.addEventListener("log", (ev) => {
      if (pausedRef.current) return;
      try {
        const entry = JSON.parse((ev as MessageEvent).data) as LogEntry;
        setLogs((prev) => {
          const next = [...prev, entry];
          return next.length > 500 ? next.slice(-500) : next;
        });
      } catch {
        // ignore
      }
    });

    return () => es.close();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current && !paused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, paused]);

  const filtered = logs.filter((l) => {
    if (levelFilter !== "all" && l.levelLabel !== levelFilter && !(levelFilter === "warn" && l.level >= 40 && l.levelLabel !== "error") && !(levelFilter === "error" && l.level >= 50)) {
      if (levelFilter === "info" && l.level < 30) return false;
      if (levelFilter === "warn" && l.level < 40) return false;
      if (levelFilter === "error" && l.level < 50) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!l.msg.toLowerCase().includes(q) && !JSON.stringify(l.context ?? {}).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const levelColor = (label: string) => {
    switch (label) {
      case "trace": return "text-[hsl(var(--muted-foreground))]";
      case "debug": return "text-[hsl(var(--muted-foreground))]";
      case "info":  return "text-[hsl(var(--primary))]";
      case "warn":  return "text-[hsl(var(--warning))]";
      case "error": return "text-[hsl(var(--destructive))]";
      case "fatal": return "text-red-600 font-bold";
      default: return "";
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[hsl(var(--primary))]" />
            Live logs
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-2">
            {connected ? (
              <><Wifi className="h-3 w-3 text-[hsl(var(--success))]" /> Connected — streaming in real time</>
            ) : (
              <><WifiOff className="h-3 w-3 text-[hsl(var(--destructive))]" /> Reconnecting…</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                levelFilter === l
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by text"
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <button
          onClick={() => setPaused(!paused)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            paused
              ? "bg-[hsl(var(--warning))] text-white"
              : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
          }`}
        >
          {paused ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}
        </button>

        <label className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer">
          <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="rounded" />
          Auto-scroll
        </label>

        <button
          onClick={() => setLogs([])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs hover:bg-[hsl(var(--accent))]"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[#0a0a0a] dark:bg-[#050505] overflow-y-auto font-mono text-xs"
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
            {search || levelFilter !== "all" ? "No logs match your filter" : "Waiting for log events…"}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((l) => (
              <div key={l.id} className="px-4 py-1.5 hover:bg-white/5 flex gap-3 items-start">
                <span className="text-[hsl(var(--muted-foreground))] shrink-0 tabular-nums">
                  {new Date(l.ts).toLocaleTimeString()}
                </span>
                <span className={`shrink-0 w-12 uppercase font-semibold ${levelColor(l.levelLabel)}`}>
                  {l.levelLabel}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-100 whitespace-pre-wrap break-words">{l.msg}</div>
                  {l.context && Object.keys(l.context).length > 0 && (
                    <div className="text-gray-500 mt-0.5 break-all">
                      {JSON.stringify(l.context)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span>{filtered.length} of {logs.length} logs shown</span>
        {paused && <span className="text-[hsl(var(--warning))]">● Paused</span>}
      </div>
    </div>
  );
}