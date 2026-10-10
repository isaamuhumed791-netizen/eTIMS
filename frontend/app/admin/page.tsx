"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Users, FileText, TrendingUp, AlertOctagon, CheckCircle2,
  Clock, XCircle, ArrowRight, Activity,
} from "lucide-react";

interface AdminStats {
  tenants: { total: number; active: number };
  users: { total: number };
  transactions: {
    total: number;
    last24h: number;
    last24hSuccess: number;
    successTotal: number;
    totalAmount: number;
    amount24h: number;
  };
  invoices: {
    total: number;
    submitted: number;
    queued: number;
    failed: number;
    successRate: number;
  };
  errors: { total: number; unresolved: number };
  queue: { waiting: number; active: number; failed: number };
  chart: { sevenDayTransactions: { day: string; count: number }[] };
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get<AdminStats>("/admin/stats")).data,
    refetchInterval: 10_000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(1, ...data.chart.sevenDayTransactions.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System overview</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Platform-wide health and activity. Auto-refreshes every 10s.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat
          label="Tenants"
          value={data.tenants.total}
          sub={`${data.tenants.active} fully connected`}
          icon={Users}
          accent="primary"
        />
        <BigStat
          label="Users"
          value={data.users.total}
          sub="across all tenants"
          icon={Users}
          accent="muted"
        />
        <BigStat
          label="Invoices"
          value={data.invoices.total}
          sub={`${data.invoices.successRate}% success rate`}
          icon={FileText}
          accent="success"
        />
        <BigStat
          label="Collected"
          value={`KES ${Math.round(data.transactions.totalAmount).toLocaleString()}`}
          sub={`KES ${Math.round(data.transactions.amount24h).toLocaleString()} last 24h`}
          icon={TrendingUp}
          accent="success"
        />
      </div>

      {/* Second row: invoice breakdown + errors + queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Invoice status" link={{ href: "/admin/errors", label: "View errors" }}>
          <div className="space-y-3">
            <BreakdownRow label="Submitted" value={data.invoices.submitted} total={data.invoices.total} icon={CheckCircle2} color="success" />
            <BreakdownRow label="Queued" value={data.invoices.queued} total={data.invoices.total} icon={Clock} color="warning" />
            <BreakdownRow label="Failed" value={data.invoices.failed} total={data.invoices.total} icon={XCircle} color="destructive" />
          </div>
        </Card>

        <Card title="Errors" link={{ href: "/admin/errors", label: "View inbox" }}>
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`text-5xl font-semibold tabular-nums ${data.errors.unresolved > 0 ? "text-red-500" : ""}`}>
              {data.errors.unresolved}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
              unresolved
            </div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
              {data.errors.total} total captured
            </div>
          </div>
        </Card>

        <Card title="Queue" link={{ href: "/admin/queue", label: "Inspect" }}>
          <div className="space-y-3">
            <BreakdownRow label="Waiting" value={data.queue.waiting} total={0} icon={Clock} color="warning" showBar={false} />
            <BreakdownRow label="Active" value={data.queue.active} total={0} icon={Activity} color="primary" showBar={false} />
            <BreakdownRow label="Failed" value={data.queue.failed} total={0} icon={AlertOctagon} color="destructive" showBar={false} />
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card title="Transactions (last 7 days)">
        <div className="flex items-end gap-2 h-40 pt-4">
          {data.chart.sevenDayTransactions.length === 0 ? (
            <div className="w-full text-center text-xs text-[hsl(var(--muted-foreground))] py-12">
              No transactions yet
            </div>
          ) : (
            data.chart.sevenDayTransactions.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">{d.count}</div>
                <div
                  className="w-full rounded-t bg-[hsl(var(--primary))] min-h-[4px] transition-all"
                  style={{ height: `${(d.count / maxCount) * 120}px` }}
                />
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {d.day.slice(5)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function BigStat({
  label, value, sub, icon: Icon, accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "success" | "muted";
}) {
  const accentClass = {
    primary: "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
    success: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
    muted: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  }[accent];

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {label}
        </div>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-3xl font-semibold mt-3 tabular-nums">{value}</div>
      <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">{sub}</div>
    </div>
  );
}

function Card({
  title, link, children,
}: {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-medium text-sm">{title}</div>
        {link && (
          <Link
            href={link.href}
            className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
          >
            {link.label} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function BreakdownRow({
  label, value, total, icon: Icon, color, showBar = true,
}: {
  label: string;
  value: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "success" | "warning" | "destructive" | "primary";
  showBar?: boolean;
}) {
  const styles = {
    success: "text-[hsl(var(--success))] bg-[hsl(var(--success))]",
    warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]",
    destructive: "text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]",
    primary: "text-[hsl(var(--primary))] bg-[hsl(var(--primary))]",
  }[color];
  const [textClass, barClass] = styles.split(" ");
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${textClass}`} />
          <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
        </div>
        <span className="tabular-nums font-medium">{value}</span>
      </div>
      {showBar && total > 0 && (
        <div className="mt-1.5 h-1 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
          <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}