"use client";
import { useQuery } from "@tanstack/react-query";
import { api, type TenantStatus } from "@/lib/api";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export function ConnectionBanner() {
  const { data: status } = useQuery({
    queryKey: ["tenant-status"],
    queryFn: async () => (await api.get<TenantStatus>("/tenant/status")).data,
  });

  if (!status) return null;
  const etimsOk = status.etims.connected;
  const mpesaOk = status.mpesa.connected;
  if (etimsOk && mpesaOk) return null;

  const missing: string[] = [];
  if (!etimsOk) missing.push("KRA eTIMS");
  if (!mpesaOk) missing.push("M-Pesa Daraja");

  return (
    <div className="rounded-xl border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 p-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium">Complete your setup</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Missing credentials: {missing.join(", ")}. Connect them to start capturing payments.
          </div>
        </div>
      </div>
      <Link
        href="/settings"
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
      >
        Connect now <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}