"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { ScrollText, Search, User, Clock, ChevronDown, ChevronRight } from "lucide-react";

interface AuditEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  payload: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => (await api.get<{ items: AuditEntry[] }>("/admin/audit?limit=200")).data,
    refetchInterval: 20_000,
  });

  const filtered = (data?.items ?? []).filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.action.toLowerCase().includes(q) ||
      (e.actorEmail ?? "").toLowerCase().includes(q) ||
      JSON.stringify(e.payload ?? {}).toLowerCase().includes(q)
    );
  });

  const actionBadge = (action: string) => {
    if (action.startsWith("tenant.suspend")) return "bg-red-500/10 text-red-500";
    if (action.startsWith("tenant.unsuspend") || action.startsWith("error.resolve")) return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]";
    if (action.startsWith("settings.update")) return "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]";
    if (action.startsWith("queue.drain")) return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
    return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-[hsl(var(--primary))]" />
            Audit trail
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Every admin action is recorded — who, what, when, from where.
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, or payload"
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
              <ScrollText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="text-sm font-medium">No audit entries</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {search ? "Try a different search" : "Admin actions will show up here"}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {filtered.map((e) => (
              <div key={e.id}>
                <button
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[hsl(var(--accent))]/50 transition-colors"
                >
                  <div className="text-[hsl(var(--muted-foreground))]">
                    {expanded === e.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${actionBadge(e.action)}`}>
                    {e.action}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] min-w-0">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{e.actorEmail ?? "system"}</span>
                    </div>
                    {e.targetType && e.targetId && (
                      <div className="text-[11px] font-mono text-[hsl(var(--muted-foreground))] truncate">
                        {e.targetType}:{e.targetId.slice(0, 8)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[hsl(var(--muted-foreground))] shrink-0">
                    <span className="font-mono">{e.ipAddress ?? "—"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(e.createdAt).toLocaleString()}
                    </span>
                  </div>
                </button>

                {expanded === e.id && e.payload && (
                  <div className="px-5 pb-4 pt-1">
                    <pre className="text-xs font-mono bg-[hsl(var(--muted))] p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        {filtered.length} of {data?.items.length ?? 0} entries
      </div>
    </div>
  );
}