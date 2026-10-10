"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { Search, Users, CheckCircle2, XCircle, Building2 } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  tin: string | null;
  plan: string;
  planExpiresAt: string | null;
  etimsConnectedAt: string | null;
  mpesaConnectedAt: string | null;
  mpesaShortcode: string | null;
  createdAt: string;
  _count: { transactions: number; invoices: number; users: number };
}

export default function AdminTenantsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-tenants", search],
    queryFn: async () => {
      const url = search ? `/admin/tenants?search=${encodeURIComponent(search)}` : "/admin/tenants";
      return (await api.get<{ items: Tenant[] }>(url)).data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            All merchants on the platform
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, slug, email"
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
              <Building2 className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="text-sm font-medium">No tenants found</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {search ? "Try a different search" : "No merchants have signed up yet"}
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">
              <tr>
                <th className="text-left font-medium px-5 py-3">Business</th>
                <th className="text-left font-medium px-3 py-3">Plan</th>
                <th className="text-center font-medium px-3 py-3">eTIMS</th>
                <th className="text-center font-medium px-3 py-3">M-Pesa</th>
                <th className="text-right font-medium px-3 py-3">Txns</th>
                <th className="text-right font-medium px-3 py-3">Invoices</th>
                <th className="text-right font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {t.email} · {t.slug}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      t.plan === "SUSPENDED"
                        ? "bg-red-500/10 text-red-500"
                        : t.plan === "PRO"
                        ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    }`}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {t.etimsConnectedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[hsl(var(--muted-foreground))] inline opacity-40" />
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {t.mpesaConnectedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[hsl(var(--muted-foreground))] inline opacity-40" />
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{t._count.transactions}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{t._count.invoices}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Users className="h-3.5 w-3.5" />
        {data?.items.length ?? 0} tenants shown
      </div>
    </div>
  );
}