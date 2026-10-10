"use client";
import { useQuery } from "@tanstack/react-query";
import { api, type StatsSummary, type Invoice } from "@/lib/api";
import {
  FileText, CheckCircle2, Clock, AlertCircle, TrendingUp, Zap,
} from "lucide-react";
import Link from "next/link";
import { ConnectionBanner } from "@/components/connection-banner";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await api.get<StatsSummary>("/invoices/stats/summary")).data,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["invoices", "recent"],
    queryFn: async () => (await api.get<{ items: Invoice[] }>("/invoices?limit=5")).data,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Overview of your M-Pesa â†’ eTIMS pipeline
        </p>
      </div>

      <ConnectionBanner />



      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total invoices"
          value={stats?.invoices.total ?? 0}
          icon={FileText}
          loading={statsLoading}
          accent="primary"
        />
        <StatCard
          label="Submitted"
          value={stats?.invoices.submitted ?? 0}
          icon={CheckCircle2}
          loading={statsLoading}
          accent="success"
        />
        <StatCard
          label="Queued"
          value={stats?.invoices.queued ?? 0}
          icon={Clock}
          loading={statsLoading}
          accent="warning"
        />
        <StatCard
          label="Failed"
          value={stats?.invoices.failed ?? 0}
          icon={AlertCircle}
          loading={statsLoading}
          accent="destructive"
        />
      </div>

      {/* Revenue card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Total collected
            </div>
            <div className="text-3xl font-semibold mt-2">
              KES {(stats?.transactions.successAmount ?? 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              from {stats?.transactions.successCount ?? 0} successful M-Pesa payments
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="font-medium">Recent invoices</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Latest submissions to KRA eTIMS
            </p>
          </div>
          <Link
            href="/invoices"
            className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
          >
            View all â†’
          </Link>
        </div>
        <div className="p-2">
          {recentLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
              ))}
            </div>
          ) : !recent?.items?.length ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[hsl(var(--muted-foreground))]">
                  <th className="text-left font-medium px-3 py-2">Receipt</th>
                  <th className="text-left font-medium px-3 py-2">Phone</th>
                  <th className="text-right font-medium px-3 py-2">Amount</th>
                  <th className="text-right font-medium px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.items.map((inv) => (
                  <tr key={inv.id} className="border-t border-[hsl(var(--border))]">
                    <td className="px-3 py-2.5 font-mono text-xs">
                      {inv.transaction.mpesaReceiptNumber ?? "â€”"}
                    </td>
                    <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))]">
                      {inv.transaction.phoneNumber}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium">
                      KES {Number(inv.transaction.amount).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <StatusPill status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, loading, accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  accent: "primary" | "success" | "warning" | "destructive";
}) {
  const accentClass = {
    primary:     "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
    success:     "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
    warning:     "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
    destructive: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
  }[accent];

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {label}
        </div>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-3xl font-semibold mt-3 tabular-nums">
        {loading ? <span className="text-[hsl(var(--muted))]">â€”</span> : value}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUBMITTED: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
    QUEUED:    "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
    FAILED:    "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
        <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="text-sm font-medium">No invoices yet</div>
      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-xs">
        Once you connect your eTIMS credentials and receive an M-Pesa payment, invoices will appear here.
      </div>
      <Link
        href="/settings"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
      >
        <Zap className="h-3 w-3" /> Connect eTIMS now
      </Link>
    </div>
  );
}