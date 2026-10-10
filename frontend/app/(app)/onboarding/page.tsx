"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type TenantStatus } from "@/lib/api";
import {
  CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff,
  AlertCircle, Zap, Building2, Smartphone, PartyPopper,
} from "lucide-react";

type Step = 0 | 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>(0);

  const { data: status, isLoading } = useQuery({
    queryKey: ["tenant-status"],
    queryFn: async () => (await api.get<TenantStatus>("/tenant/status")).data,
    refetchInterval: 5000,
  });

  // Auto-skip already connected steps
  useEffect(() => {
    if (!status) return;
    if (status.etims.connected && step === 1) setStep(2);
    if (status.mpesa.connected && step === 2) setStep(3);
  }, [status, step]);

  if (isLoading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
            <Zap className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div className="text-lg font-semibold">eTIMS Middleware</div>
        </div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Content */}
        <div className="mt-10">
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
          {step === 1 && (
            <EtimsStep
              status={status}
              onBack={() => setStep(0)}
              onNext={() => {
                qc.invalidateQueries({ queryKey: ["tenant-status"] });
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <MpesaStep
              status={status}
              onBack={() => setStep(1)}
              onNext={() => {
                qc.invalidateQueries({ queryKey: ["tenant-status"] });
                setStep(3);
              }}
            />
          )}
          {step === 3 && <DoneStep onFinish={() => router.push("/dashboard")} />}
        </div>
      </div>
    </div>
  );
}

// ---------- Progress ----------
function ProgressBar({ step }: { step: Step }) {
  const labels = ["Welcome", "KRA eTIMS", "M-Pesa", "Done"];
  return (
    <div className="flex items-center justify-between">
      {labels.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  done
                    ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                    : active
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <div
                className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                  active ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {label}
              </div>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 -mt-5 ${
                  done ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--border))]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Step 0: Welcome ----------
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
        <Building2 className="h-6 w-6 text-[hsl(var(--primary))]" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Let's get you set up</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 max-w-md mx-auto">
        In the next two minutes we'll connect your KRA eTIMS account and M-Pesa Daraja credentials.
        Every M-Pesa payment will then be automatically invoiced to KRA in real time.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
        <Feature icon={Building2} label="Connect KRA eTIMS" />
        <Feature icon={Smartphone} label="Connect M-Pesa Daraja" />
        <Feature icon={Zap} label="Automate invoices" />
      </div>

      <button
        onClick={onNext}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
      >
        Get started <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 flex items-center gap-2.5">
      <div className="h-7 w-7 rounded-md bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
      </div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}

// ---------- Step 1: eTIMS ----------
function EtimsStep({ status, onBack, onNext }: { status: TenantStatus; onBack: () => void; onNext: () => void }) {
  const [tin, setTin] = useState(status.etims.tin ?? "");
  const [bhfId, setBhfId] = useState(status.etims.bhfId ?? "00");
  const [dvcSrlNo, setDvcSrlNo] = useState(
    status.etims.dvcSrlNo ?? "MW-" + Math.random().toString(36).slice(2, 10).toUpperCase()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await api.post("/tenant/etims/connect", {
        tin, bhfId, dvcSrlNo,
        baseUrl: "https://etims-api-sbx.kra.go.ke/etims-api",
      });
      onNext();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Could not connect. Please check your KRA PIN.");
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
      <StepHeader
        step="Step 1 of 3"
        title="Connect KRA eTIMS"
        subtitle="Enter your KRA PIN. We'll generate your device serial and fetch your CMC key automatically."
      />

      <form onSubmit={submit} className="mt-6 space-y-4">
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

        {error && (
          <div className="flex items-start gap-2 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <NavButtons onBack={onBack} loading={loading} submitLabel="Connect and continue" />
      </form>
    </div>
  );
}

// ---------- Step 2: M-Pesa ----------
function MpesaStep({ status, onBack, onNext }: { status: TenantStatus; onBack: () => void; onNext: () => void }) {
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [passkey, setPasskey] = useState("");
  const [shortcode, setShortcode] = useState(status.mpesa.shortcode ?? "174379");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await api.post("/tenant/mpesa/connect", {
        consumerKey, consumerSecret, passkey, shortcode,
        environment: "sandbox",
      });
      onNext();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Could not validate M-Pesa credentials.");
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
      <StepHeader
        step="Step 2 of 3"
        title="Connect M-Pesa Daraja"
        subtitle="Paste your Daraja consumer key, secret, and passkey. We validate them instantly."
      />

      <a
        href="https://developer.safaricom.co.ke"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline"
      >
        Open Daraja portal to get these keys →
      </a>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="Consumer Key">
          <input required value={consumerKey} onChange={(e) => setConsumerKey(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </Field>

        <Field label="Consumer Secret">
          <div className="relative">
            <input required type={showSecret ? "text" : "password"} value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            <button type="button" onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[hsl(var(--muted-foreground))]">
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field label="Passkey" hint="Lipa na M-Pesa passkey">
          <input required value={passkey} onChange={(e) => setPasskey(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </Field>

        <Field label="Shortcode" hint="174379 for sandbox">
          <input required value={shortcode} onChange={(e) => setShortcode(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </Field>

        {error && (
          <div className="flex items-start gap-2 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <NavButtons onBack={onBack} loading={loading} submitLabel="Validate and continue" />
      </form>
    </div>
  );
}

// ---------- Step 3: Done ----------
function DoneStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--success))]/10 flex items-center justify-center mx-auto mb-4">
        <PartyPopper className="h-6 w-6 text-[hsl(var(--success))]" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">You're all set!</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 max-w-md mx-auto">
        Both connections are live. As soon as you receive an M-Pesa payment, we'll auto-generate
        your KRA eTIMS invoice in the background.
      </p>

      <button
        onClick={onFinish}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
      >
        Go to dashboard <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------- Shared components ----------
function StepHeader({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--primary))] font-semibold">{step}</div>
      <h2 className="text-xl font-semibold tracking-tight mt-1">{title}</h2>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{subtitle}</p>
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

function NavButtons({ onBack, loading, submitLabel }: { onBack: () => void; loading: boolean; submitLabel: string }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <button type="button" onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <button type="submit" disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-5 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity">
        {loading ? "Please wait…" : submitLabel} <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}