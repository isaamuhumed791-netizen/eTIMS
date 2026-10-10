"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon, Save, Mail, Phone, Clock, MessageCircle, Power, Loader2, CheckCircle2,
} from "lucide-react";

interface SettingsResponse {
  keys: string[];
  values: Record<string, string>;
}

const SUPPORT_FIELDS = [
  { key: "support.email",         label: "Support email",         icon: Mail,          type: "email", placeholder: "support@yourdomain.com" },
  { key: "support.whatsapp",      label: "WhatsApp number",       icon: MessageCircle, type: "text",  placeholder: "254712345678 (digits only)" },
  { key: "support.phoneDisplay",  label: "Phone (display)",       icon: Phone,         type: "text",  placeholder: "+254 712 345 678" },
  { key: "support.hours",         label: "Support hours",         icon: Clock,         type: "text",  placeholder: "Mon-Fri, 8am - 6pm EAT" },
];

const TOGGLE_FIELDS = [
  { key: "feature.etims.enabled", label: "KRA eTIMS integration enabled", description: "If off, tenants cannot connect or submit invoices to KRA" },
  { key: "feature.mpesa.enabled", label: "M-Pesa integration enabled",     description: "If off, tenants cannot connect to Daraja or send STK pushes" },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await api.get<SettingsResponse>("/admin/settings")).data,
  });

  useEffect(() => {
    if (data?.values) setDraft(data.values);
  }, [data]);

  const save = useMutation({
    mutationFn: (values: Record<string, string>) =>
      api.put("/admin/settings", { values }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      flash("Settings saved. Tenant UI will pick them up instantly.");
    },
  });

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  if (isLoading || !data) {
    return <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading settings…</div>;
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(data.values);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
            Platform settings
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Support contacts shown to tenants and global feature toggles.
          </p>
        </div>
        <button
          onClick={() => save.mutate(draft)}
          disabled={!dirty || save.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-40"
        >
          {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {save.isPending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>

      {/* Support contacts */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="font-medium text-sm">Support contacts</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            These appear on the tenant sidebar "Get help" link and the Settings page "Need help?" card.
          </div>
        </div>
        <div className="p-5 space-y-4">
          {SUPPORT_FIELDS.map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                <Icon className="h-3.5 w-3.5" /> {label}
              </label>
              <input
                type={type}
                value={draft[key] ?? ""}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <div className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] mt-1">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature toggles */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="font-medium text-sm flex items-center gap-2">
            <Power className="h-4 w-4 text-[hsl(var(--warning))]" />
            Feature toggles
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Kill-switches for the integrations. Disable in an emergency.
          </div>
        </div>
        <div className="p-5 space-y-4">
          {TOGGLE_FIELDS.map(({ key, label, description }) => {
            const enabled = (draft[key] ?? "true") === "true";
            return (
              <div key={key} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{description}</div>
                  <div className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] mt-1">{key}</div>
                </div>
                <button
                  onClick={() => setDraft({ ...draft, [key]: enabled ? "false" : "true" })}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    enabled
                      ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${enabled ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--muted-foreground))]"}`} />
                  {enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-4 py-2 text-sm shadow-lg">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}
    </div>
  );
}