import {
  Zap, Lock, RefreshCcw, Activity, Building2, ScrollText,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Under 3 seconds per invoice",
    description:
      "Webhook in, invoice out. KRA responds before your customer puts their phone down.",
  },
  {
    icon: RefreshCcw,
    title: "Retries when KRA is down",
    description:
      "KRA sandbox and production go offline regularly. We retry 3 times with exponential backoff — 5s, 15s, 45s — then flag it in your dashboard.",
  },
  {
    icon: Lock,
    title: "Credentials never leave encrypted",
    description:
      "AES-256-GCM at rest. Your Daraja keys, passkey, and CMC key are decrypted only when we submit an invoice. Never logged.",
  },
  {
    icon: Activity,
    title: "Watch it happen live",
    description:
      "Every webhook, every job, every KRA response — streaming in real time. If something fails, you see the exact reason in seconds.",
  },
  {
    icon: Building2,
    title: "One account, many businesses",
    description:
      "Running multiple shops, branches, or clients? Each gets its own credentials, invoices, and audit trail — fully isolated.",
  },
  {
    icon: ScrollText,
    title: "Every action is audited",
    description:
      "Credential changes, invoice submissions, admin actions — all timestamped and stored. Useful when KRA asks questions.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--primary))] mb-3">
            What you get
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Built for the boring parts of compliance
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Nothing here is fancy. It's the plumbing that keeps you out of trouble with KRA — done properly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}