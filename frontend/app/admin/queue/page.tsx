"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  ListChecks, RotateCcw, Droplets, RefreshCw, Clock, Activity, CheckCircle2, XCircle, AlertOctagon,
} from "lucide-react";

interface QueueStats {
  queue: string;
  counts: {
    waiting?: number;
    active?: number;
    completed?: number;
    failed?: number;
    delayed?: number;
    paused?: number;
  };
  recentCompleted: { id: string; name: string; finishedOn?: number; data: unknown }[];
  recentFailed: { id: string; name: string; failedReason?: string; attemptsMade: number; data: unknown }[];
}

export default function AdminQueuePage() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-queue"],
    queryFn: async () => (await api.get<QueueStats>("/admin/queue/stats")).data,
    refetchInterval: 5000,
  });

  const retryAll = useMutation({
    mutationFn: () => api.post("/admin/queue/retry-failed"),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["admin-queue"] });
      flash(`Retried ${(r.data as { retried: number }).retried} failed jobs`);
    },
  });

  const drain = useMutation({
    mutationFn: () => api.post("/admin/queue/drain"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-queue"] });
      flash("Queue drained");
    },
  });

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  if (isLoading || !data) {
    return <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading queue…</div>;
  }

  const c = data.counts;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[hsl(var(--primary))]" />
            Queue inspector
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            BullMQ: <span className="font-mono">{data.queue}</span> — auto-refreshes every 5s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs hover:bg-[hsl(var(--accent))] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => retryAll.mutate()}
            disabled={retryAll.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry all failed
          </button>
          <button
            onClick={() => { if (confirm("Drain the queue? All waiting jobs will be removed.")) drain.mutate(); }}
            disabled={drain.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-60"
          >
            <Droplets className="h-3.5 w-3.5" /> Drain
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <CountCard label="Waiting" value={c.waiting ?? 0} icon={Clock} color="warning" />
        <CountCard label="Active" value={c.active ?? 0} icon={Activity} color="primary" />
        <CountCard label="Completed" value={c.completed ?? 0} icon={CheckCircle2} color="success" />
        <CountCard label="Failed" value={c.failed ?? 0} icon={XCircle} color="destructive" />
        <CountCard label="Delayed" value={c.delayed ?? 0} icon={Clock} color="muted" />
        <CountCard label="Paused" value={c.paused ?? 0} icon={AlertOctagon} color="muted" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Recent failures" empty={!data.recentFailed.length}>
          {data.recentFailed.map((j) => (
            <div key={j.id} className="px-5 py-3 border-b border-[hsl(var(--border))] last:border-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs">{j.id}</span>
                <span className="text-[10px] text-[hsl(var(--destructive))]">
                  attempts: {j.attemptsMade}
                </span>
              </div>
              <div className="text-xs text-[hsl(var(--destructive))] mt-1 truncate">
                {j.failedReason ?? "Unknown"}
              </div>
              <div className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] mt-1 truncate">
                {JSON.stringify(j.data)}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Recent completions" empty={!data.recentCompleted.length}>
          {data.recentCompleted.map((j) => (
            <div key={j.id} className="px-5 py-3 border-b border-[hsl(var(--border))] last:border-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs">{j.id}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {j.finishedOn ? new Date(j.finishedOn).toLocaleTimeString() : "—"}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] mt-1 truncate">
                {JSON.stringify(j.data)}
              </div>
            </div>
          ))}
        </Section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function CountCard({ label, value, icon: Icon, color }: {
  label: string; value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "destructive" | "muted";
}) {
  const cls = {
    primary: "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
    success: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
    destructive: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
    muted: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  }[color];
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{label}</div>
        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${cls}`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <div className="text-2xl font-semibold mt-2 tabular-nums">{value}</div>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <div className="px-5 py-3 border-b border-[hsl(var(--border))]">
        <div className="font-medium text-sm">{title}</div>
      </div>
      {empty ? (
        <div className="text-xs text-[hsl(var(--muted-foreground))] py-8 text-center">No jobs</div>
      ) : children}
    </div>
  );
}