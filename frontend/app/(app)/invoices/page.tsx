"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Invoice } from "@/lib/api";
import {
  Search, RefreshCw, FileText, ChevronDown, ChevronRight,
  RotateCcw, CheckCircle2, Clock, AlertCircle, XCircle,
} from "lucide-react";

type Filter = "ALL" | "SUBMITTED" | "QUEUED" | "FAILED";

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["invoices", filter],
    queryFn: async () => {
      const url = filter === "ALL" ? "/invoices?limit=100" : `/invoices?limit=100&status=${filter}`;
      return (await api.get<{ items: Invoice[] }>(url)).data;
    },
    refetchInterval: 10_000,
  });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.transaction.mpesaReceiptNumber?.toLowerCase().includes(q) ||
        i.transaction.phoneNumber?.toLowerCase().includes(q) ||
        i.kraInvoiceNumber?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    return {
      ALL: items.length,
      SUBMITTED: items.filter((i) => i.status === "SUBMITTED").length,
      QUEUED: items.filter((i) => i.status === "QUEUED").length,
      FAILED: items.filter((i) => i.status === "FAILED").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Every M-Pesa payment and its eTIMS submission status
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-medium hover:bg-[hsl(var(--accent))] disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
          {(["ALL", "SUBMITTED", "QUEUED", "FAILED"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
              <span className={`ml-1.5 text-[10px] ${filter === f ? "opacity-80" : "opacity-60"}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt, phone, or KRA invoice number"
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
            ))}
          </div>
        ) : !filtered.length ? (
          <EmptyState filter={filter} search={search} />
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {filtered.map((inv) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                expanded={expanded === inv.id}
                onToggle={() => setExpanded(expanded === inv.id ? null : inv.id)}
                onRetry={() => qc.invalidateQueries({ queryKey: ["invoices"] })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice, expanded, onToggle, onRetry,
}: {
  invoice: Invoice;
  expanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
}) {
  const qc = useQueryClient();
  const retry = useMutation({
    mutationFn: async () => api.post(`/invoices/${invoice.id}/retry`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      onRetry();
    },
  });

  const statusStyles: Record<string, string> = {
    SUBMITTED: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
    QUEUED: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
    FAILED: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30",
  };
  const StatusIcon = {
    SUBMITTED: CheckCircle2,
    QUEUED: Clock,
    FAILED: XCircle,
  }[invoice.status] ?? AlertCircle;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[hsl(var(--accent))]/50 transition-colors"
      >
        <div className="text-[hsl(var(--muted-foreground))]">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        <div className="flex-1 grid grid-cols-12 gap-3 items-center min-w-0">
          <div className="col-span-3 min-w-0">
            <div className="font-mono text-xs truncate">
              {invoice.transaction.mpesaReceiptNumber ?? "—"}
            </div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
              {new Date(invoice.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="col-span-2 text-xs text-[hsl(var(--muted-foreground))] truncate">
            {invoice.transaction.phoneNumber}
          </div>
          <div className="col-span-2 text-sm font-medium tabular-nums">
            KES {Number(invoice.transaction.amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
          </div>
          <div className="col-span-2 text-xs font-mono text-[hsl(var(--muted-foreground))] truncate">
            {invoice.kraInvoiceNumber ? `#${invoice.kraInvoiceNumber}` : "—"}
          </div>
          <div className="col-span-3 flex justify-end">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${statusStyles[invoice.status]}`}>
              <StatusIcon className="h-3 w-3" />
              {invoice.status}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 bg-[hsl(var(--muted))]/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <DetailBlock title="M-Pesa">
              <Row label="Receipt" value={invoice.transaction.mpesaReceiptNumber ?? "—"} mono />
              <Row label="Phone" value={invoice.transaction.phoneNumber} />
              <Row label="Amount" value={`KES ${Number(invoice.transaction.amount).toLocaleString()}`} />
              <Row label="Checkout ID" value={invoice.transaction.checkoutRequestId ?? "—"} mono />
              <Row label="Received" value={new Date(invoice.createdAt).toLocaleString()} />
            </DetailBlock>
            <DetailBlock title="KRA eTIMS">
              <Row label="Status" value={invoice.status} />
              <Row label="KRA Invoice" value={invoice.kraInvoiceNumber ?? "—"} mono />
              <Row label="SDC ID" value={invoice.sdcId ?? "—"} mono />
              <Row label="Signature" value={invoice.receiptSignature ?? "—"} mono />
              <Row label="Retries" value={String(invoice.retryCount)} />
            </DetailBlock>
          </div>

          {invoice.errorMessage && (
            <div className="mt-4 flex items-start gap-2 text-xs text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2.5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="min-w-0 break-words">
                <div className="font-medium mb-0.5">Last error</div>
                <div className="opacity-90">{invoice.errorMessage}</div>
              </div>
            </div>
          )}

          {invoice.status === "FAILED" && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); retry.mutate(); }}
                disabled={retry.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <RotateCcw className={`h-3 w-3 ${retry.isPending ? "animate-spin" : ""}`} />
                {retry.isPending ? "Retrying..." : "Retry submission"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium mb-3">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[hsl(var(--muted-foreground))] shrink-0">{label}</span>
      <span className={`truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function EmptyState({ filter, search }: { filter: Filter; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
        <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="text-sm font-medium">
        {search ? "No matches" : filter === "ALL" ? "No invoices yet" : `No ${filter.toLowerCase()} invoices`}
      </div>
      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-sm">
        {search
          ? "Try a different search term."
          : "Once M-Pesa payments arrive, invoices will show up here automatically."}
      </div>
    </div>
  );
}