"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  AlertOctagon, CheckCircle2, Trash2, RefreshCcw, Search,
} from "lucide-react";

interface ErrorEvent {
  id: string;
  tenantId: string | null;
  source: string;
  message: string;
  stack: string | null;
  context: Record<string, unknown> | null;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export default function AdminErrorsPage() {
  const qc = useQueryClient();
  const [showResolved, setShowResolved] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-errors", showResolved],
    queryFn: async () => {
      const url = showResolved ? "/admin/errors?resolved=true" : "/admin/errors";
      return (await api.get<{ items: ErrorEvent[] }>(url)).data;
    },
    refetchInterval: 15_000,
  });

  const resolve = useMutation({
    mutationFn: (id: string) => api.post(`/admin/errors/${id}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-errors"] }),
  });
  const unresolve = useMutation({
    mutationFn: (id: string) => api.post(`/admin/errors/${id}/unresolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-errors"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/errors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-errors"] }),
  });

  const filtered = (data?.items ?? []).filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.message.toLowerCase().includes(q) || e.source.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Errors</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Grouped failures from workers, webhooks, and API. Auto-refreshes every 15s.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              showResolved
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {showResolved ? "Showing resolved" : "Showing active"}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search message or source"
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 py-2 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div className="text-sm font-medium">
              {showResolved ? "No resolved errors" : "All clear"}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {search ? "Try a different search" : "No errors captured in this view"}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {filtered.map((e) => (
              <div key={e.id}>
                <button
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-[hsl(var(--accent))]/50 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${
                    e.resolved ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                              : "bg-red-500/10 text-red-500"
                  }`}>
                    {e.resolved ? <CheckCircle2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        {e.source}
                      </span>
                      {e.tenantId && (
                        <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">
                          tenant: {e.tenantId.slice(0, 8)}
                        </span>
                      )}
                      {e.count > 1 && (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-[10px] font-semibold">
                          × {e.count}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium mt-1 truncate">{e.message}</div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
                      First seen {new Date(e.firstSeenAt).toLocaleString()} · Last seen {new Date(e.lastSeenAt).toLocaleString()}
                    </div>
                  </div>
                </button>

                {expanded === e.id && (
                  <div className="px-5 pb-5 pt-1 bg-[hsl(var(--muted))]/30 space-y-3">
                    {e.stack && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Stack trace</div>
                        <pre className="text-xs font-mono bg-[hsl(var(--background))] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all max-h-64">
                          {e.stack}
                        </pre>
                      </div>
                    )}
                    {e.context && Object.keys(e.context).length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Context</div>
                        <pre className="text-xs font-mono bg-[hsl(var(--background))] p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(e.context, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      {e.resolved ? (
                        <button
                          onClick={(ev) => { ev.stopPropagation(); unresolve.mutate(e.id); }}
                          disabled={unresolve.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))] disabled:opacity-60"
                        >
                          <RefreshCcw className="h-3 w-3" /> Reopen
                        </button>
                      ) : (
                        <button
                          onClick={(ev) => { ev.stopPropagation(); resolve.mutate(e.id); }}
                          disabled={resolve.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--success))] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Mark resolved
                        </button>
                      )}
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (confirm("Delete this error permanently?")) remove.mutate(e.id);
                        }}
                        disabled={remove.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-60"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}