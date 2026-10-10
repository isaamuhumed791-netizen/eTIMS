"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupportSettings, mailtoSupport, whatsappSupport } from "@/lib/support";
import { api, type TenantStatus } from "@/lib/api";
import { useState } from "react";
import {
  CheckCircle2, XCircle, Eye, EyeOff, AlertCircle, ExternalLink, Phone,
} from "lucide-react";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: status, isLoading } = useQuery({
    queryKey: ["tenant-status"],
    queryFn: async () => (await api.get<TenantStatus>("/tenant/status")).data,
  });

  if (isLoading) {
    return <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Connect your KRA eTIMS and M-Pesa Daraja credentials. Everything is encrypted before storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard
          title="KRA eTIMS"
          connected={!!status?.etims.connected}
          details={
            status?.etims.connected
              ? [
                  ["TIN", status.etims.tin ?? "-"],
                  ["Branch", status.etims.bhfId ?? "-"],
                  ["Device Serial", status.etims.dvcSrlNo ?? "-"],
                  ["Connected", new Date(status.etims.connectedAt!).toLocaleString()],
                ]
              : []
          }
        />
        <StatusCard
          title="M-Pesa Daraja"
          connected={!!status?.mpesa.connected}
          details={
            status?.mpesa.connected
              ? [
                  ["Shortcode", status.mpesa.shortcode ?? "-"],
                  ["Environment", status.mpesa.environment ?? "-"],
                  ["Connected", new Date(status.mpesa.connectedAt!).toLocaleString()],
                ]
              : []
          }
        />
      </div>

      <EtimsConnectCard
        connected={!!status?.etims.connected}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["tenant-status"] })}
      />

      <MpesaConnectCard
        connected={!!status?.mpesa.connected}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["tenant-status"] })}
      />

      <SupportCard />
    </div>
  );
}

function StatusCard({ title, connected, details }: { title: string; connected: boolean; details: [string, string][] }) {
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
      {connected && details.length > 0 ? (
        <dl className="space-y-1.5 text-xs">
          {details.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
              <dd className="font-mono">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="text-xs text-[hsl(var(--muted-foreground))]">Configure below to activate</div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {hint && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{hint}</div>}
    </div>
  );
}

function HelpToggle({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline"
      >
        <ExternalLink className="h-3 w-3" /> {open ? "Hide help" : "Where do I get these?"}
      </button>
      {open && (
        <div className="text-xs bg-[hsl(var(--muted))] rounded-lg p-4 space-y-2">
          {children}
        </div>
      )}
    </>
  );
}

function SupportCard() {
  const support = useSupportSettings();
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div className="font-medium">Need help?</div>
      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
        We are here to help you get set up. {support.hours}.
      </div>
      {support.phoneDisplay && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Or call us on <span className="font-medium text-[hsl(var(--foreground))]">{support.phoneDisplay}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        <a
          href={mailtoSupport(support.email)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors"
        >
          Email support
        </a>
        <a
          href={whatsappSupport(support.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
        >
          WhatsApp us
        </a>
        {support.phoneDisplay && (
          <a
            href={`tel:${support.phoneDisplay.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> Call us
          </a>
        )}
      </div>
    </div>
  );
}

// ---------- eTIMS Connect ----------
function EtimsConnectCard({ connected, onSuccess }: { connected: boolean; onSuccess: () => void }) {
  const [expanded, setExpanded] = useState(!connected);
  const [showHelp, setShowHelp] = useState(false);
  const [tin, setTin] = useState("");
  const [bhfId, setBhfId] = useState("00");
  const [dvcSrlNo, setDvcSrlNo] = useState("MW-" + Math.random().toString(36).slice(2, 10).toUpperCase());
  const [baseUrl, setBaseUrl] = useState("https://etims-api-sbx.kra.go.ke/etims-api");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true); setOk(false);
    try {
      await api.post("/tenant/etims/connect", { tin, bhfId, dvcSrlNo, baseUrl });
      setOk(true);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Connection failed");
    } finally { setLoading(false); }
  }

  async function disconnect() {
    if (!confirm("Disconnect eTIMS? Your CMC key will be deleted.")) return;
    await api.post("/tenant/etims/disconnect");
    onSuccess();
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div>
          <div className="font-medium">KRA eTIMS Connection</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Enter your KRA PIN. We generate the device serial and fetch your CMC key automatically.
          </div>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-5 border-t border-[hsl(var(--border))] space-y-4">
          <HelpToggle open={showHelp} onToggle={() => setShowHelp(!showHelp)}>
            <p className="font-medium">Get your eTIMS credentials:</p>
            <ol className="list-decimal list-inside space-y-1 text-[hsl(var(--muted-foreground))]">
              <li>
                Your <strong>KRA PIN</strong> is on your{" "}
                <a href="https://itax.kra.go.ke" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline">
                  KRA iTax portal
                </a>{" "}
                or any tax invoice
              </li>
              <li><strong>Branch ID</strong> is almost always <strong>00</strong> for head office</li>
              <li><strong>Device Serial</strong> is auto-generated. Only change it if KRA issued one to you</li>
              <li>
                Onboarding a new device?{" "}
                <a href="https://etims.kra.go.ke" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline">
                  Visit the eTIMS portal
                </a>
              </li>
            </ol>
          </HelpToggle>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="KRA PIN (TIN)" hint="Your business PIN, e.g. P051234567X">
              <input required value={tin} onChange={(e) => setTin(e.target.value.toUpperCase())}
                placeholder="P051234567X"
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Branch ID" hint="Usually 00 for HQ">
                <input required value={bhfId} onChange={(e) => setBhfId(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              </Field>
              <Field label="Device Serial" hint="Auto-generated">
                <input required value={dvcSrlNo} onChange={(e) => setDvcSrlNo(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              </Field>
            </div>

            <Field label="eTIMS API Base URL" hint="Only change if KRA gave you a different URL">
              <input required value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </Field>

            {error && (
              <div className="flex items-start gap-2 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {ok && (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 px-3 py-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4" /> eTIMS connected successfully
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity">
                {loading ? "Connecting..." : connected ? "Reconnect eTIMS" : "Connect eTIMS"}
              </button>
              {connected && (
                <button type="button" onClick={disconnect}
                  className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ---------- M-Pesa Connect ----------
function MpesaConnectCard({ connected, onSuccess }: { connected: boolean; onSuccess: () => void }) {
  const [expanded, setExpanded] = useState(!connected);
  const [showHelp, setShowHelp] = useState(false);
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [passkey, setPasskey] = useState("");
  const [shortcode, setShortcode] = useState("174379");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true); setOk(false);
    try {
      await api.post("/tenant/mpesa/connect", {
        consumerKey, consumerSecret, passkey, shortcode, environment,
      });
      setOk(true);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Connection failed");
    } finally { setLoading(false); }
  }

  async function disconnect() {
    if (!confirm("Disconnect M-Pesa? Your credentials will be deleted.")) return;
    await api.post("/tenant/mpesa/disconnect");
    onSuccess();
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div>
          <div className="font-medium">M-Pesa Daraja Connection</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Paste your Daraja consumer key, secret, and passkey. We validate them instantly.
          </div>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-5 border-t border-[hsl(var(--border))] space-y-4">
          <HelpToggle open={showHelp} onToggle={() => setShowHelp(!showHelp)}>
            <p className="font-medium">Get your Daraja credentials:</p>
            <ol className="list-decimal list-inside space-y-1 text-[hsl(var(--muted-foreground))]">
              <li>
                Go to{" "}
                <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline">
                  developer.safaricom.co.ke
                </a>{" "}
                and sign in
              </li>
              <li>Click <strong>My Apps</strong> then <strong>Create New App</strong></li>
              <li>Copy the <strong>Consumer Key</strong> and <strong>Consumer Secret</strong></li>
              <li>For sandbox, the passkey is publicly shown on the app page</li>
              <li>Shortcode: <strong>174379</strong> for sandbox</li>
              <li>
                Need more detail?{" "}
                <a href="https://developer.safaricom.co.ke/Docs" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline">
                  Read the Daraja docs
                </a>
              </li>
            </ol>
          </HelpToggle>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Consumer Key" hint="From Daraja My Apps">
              <input required value={consumerKey} onChange={(e) => setConsumerKey(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </Field>

            <Field label="Consumer Secret" hint="From Daraja My Apps">
              <div className="relative">
                <input required type={showSecret ? "text" : "password"} value={consumerSecret} onChange={(e) => setConsumerSecret(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
                <button type="button" onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Passkey" hint="Lipa na M-Pesa passkey">
              <input required value={passkey} onChange={(e) => setPasskey(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Shortcode" hint="174379 for sandbox">
                <input required value={shortcode} onChange={(e) => setShortcode(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              </Field>
              <Field label="Environment" hint="Sandbox for testing">
                <select value={environment} onChange={(e) => setEnvironment(e.target.value as "sandbox" | "production")}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </Field>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {ok && (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 px-3 py-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4" /> M-Pesa connected successfully
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity">
                {loading ? "Validating..." : connected ? "Reconnect M-Pesa" : "Connect M-Pesa"}
              </button>
              {connected && (
                <button type="button" onClick={disconnect}
                  className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}