"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, CheckCircle2, XCircle, Building2, User as UserIcon,
  Ban, RotateCcw,
} from "lucide-react";

interface TenantDetail {
  tenant: {
    id: string; name: string; slug: string; email: string;
    phone: string | null; tin: string | null; bhfId: string | null;
    dvcSrlNo: string | null; etimsConnectedAt: string | null;
    mpesaShortcode: string | null; mpesaEnv: string | null;
    mpesaConnectedAt: string | null; plan: string;
    planExpiresAt: string | null; createdAt: string;
    users: { id: string; email: string; fullName: string; role: string; createdAt: string }[];
    _count: { transactions: number; invoices: number; users: number; apiKeys: number };
  };
  recentTransactions: {
    id: string; mpesaReceiptNumber: string | null; amount: string;
    phoneNumber: string; status: string; createdAt: string;
  }[];
  invoiceStats: Record<string, number>;
}

export default function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tenant", id],
    queryFn: async () => (await api.get<TenantDetail>(`/admin/tenants/${id}`)).data,
  });

  const suspend = useMutation({
    mutationFn: () => api.post(`/admin/tenants/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tenant", id] }); flash("Tenant suspended"); },
  });
  const unsuspend = useMutation({
    mutationFn: () => api.post(`/admin/tenants/${id}/unsuspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tenant", id] }); flash("Tenant reactivated"); },
  });

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  if (isLoading || !data) {
    return <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</div>;
  }
  const t = data.tenant;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/tenants" className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to tenants
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t.name}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t.email} · {t.slug} · joined {new Date(t.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
            t.plan === "SUSPENDED" ? "bg-red-500/10 text-red-500" : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
          }`}>{t.plan}</span>
          {t.plan === "SUSPENDED" ? (
            <button onClick={() => unsuspend.mutate()} disabled={unsuspend.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60">
              <RotateCcw className="h-3.5 w-3.5" /> Reactivate
            </button>
          ) : (
            <button onClick={() => { if (confirm("Suspend this tenant?")) suspend.mutate(); }} disabled={suspend.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-60">
              <Ban className="h-3.5 w-3.5" /> Suspend
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard title="KRA eTIMS" connected={!!t.etimsConnectedAt}
          rows={t.etimsConnectedAt ? [
            ["TIN", t.tin ?? "—"], ["Branch", t.bhfId ?? "—"],
            ["Device Serial", t.dvcSrlNo ?? "—"],
            ["Connected", new Date(t.etimsConnectedAt).toLocaleString()],
          ] : []} />
        <StatusCard title="M-Pesa Daraja" connected={!!t.mpesaConnectedAt}
          rows={t.mpesaConnectedAt ? [
            ["Shortcode", t.mpesaShortcode ?? "—"],
            ["Environment", t.mpesaEnv ?? "—"],
            ["Connected", new Date(t.mpesaConnectedAt).toLocaleString()],
          ] : []} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Counter label="Transactions" value={t._count.transactions} />
        <Counter label="Invoices" value={t._count.invoices} />
        <Counter label="Users" value={t._count.users} />
        <Counter label="API keys" value={t._count.apiKeys} />
      </div>

      <Section title="Users">
        <table className="w-full text-sm">
          <thead className="text-xs text-[hsl(var(--muted-foreground))]">
            <tr>
              <th className="text-left font-medium px-5 py-2">Name</th>
              <th className="text-left font-medium px-3 py-2">Email</th>
              <th className="text-left font-medium px-3 py-2">Role</th>
              <th className="text-right font-medium px-5 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {t.users.map((u) => (
              <tr key={u.id} className="border-t border-[hsl(var(--border))]">
                <td className="px-5 py-2.5 flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  {u.fullName}
                </td>
                <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))]">{u.email}</td>
                <td className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{u.role}</td>
                <td className="px-5 py-2.5 text-right text-[hsl(var(--muted-foreground))]">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Recent transactions">
        {data.recentTransactions.length === 0 ? (
          <div className="text-xs text-[hsl(var(--muted-foreground))] py-6 text-center">No transactions yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="text-left font-medium px-5 py-2">Receipt</th>
                <th className="text-left font-medium px-3 py-2">Phone</th>
                <th className="text-right font-medium px-3 py-2">Amount</th>
                <th className="text-right font-medium px-3 py-2">Status</th>
                <th className="text-right font-medium px-5 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-5 py-2.5 font-mono text-xs">{tx.mpesaReceiptNumber ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))]">{tx.phoneNumber}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">KES {Number(tx.amount).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      tx.status === "SUCCESS" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" :
                      tx.status === "FAILED" ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" :
                      "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-[hsl(var(--muted-foreground))] text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function StatusCard({ title, connected, rows }: { title: string; connected: boolean; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-sm">{title}</div>
        {connected ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--success))]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            <XCircle className="h-3.5 w-3.5" /> Not connected
          </span>
        )}
      </div>
      {connected ? (
        <dl className="space-y-1.5 text-xs">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
              <dd className="font-mono truncate">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="text-xs text-[hsl(var(--muted-foreground))]">Not configured</div>
      )}
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <div className="px-5 py-3 border-b border-[hsl(var(--border))]">
        <div className="font-medium text-sm">{title}</div>
      </div>
      {children}
    </div>
  );
}