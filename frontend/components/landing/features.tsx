import {
  Zap, ShieldCheck, RefreshCcw, Activity, Building2, ScrollText,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-time automation",
    description: "Invoices submitted to KRA within seconds of the M-Pesa callback. No human in the loop.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade encryption",
    description: "Your Daraja keys and CMC key are AES-256-GCM encrypted at rest. Never logged, never exposed.",
  },
  {
    icon: RefreshCcw,
    title: "Automatic retries",
    description: "KRA servers down? Failed submissions retry with exponential backoff until they succeed.",
  },
  {
    icon: Activity,
    title: "Live observability",
    description: "Real-time log stream of every webhook, every job, every KRA response. Debug in seconds.",
  },
  {
    icon: Building2,
    title: "Multi-tenant by design",
    description: "One instance serves unlimited businesses with isolated data, credentials, and audit trails.",
  },
  {
    icon: ScrollText,
    title: "Complete audit trail",
    description: "Every admin action, credential change, and system event is permanently logged for compliance.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--primary))] mb-3">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Everything you need to stay compliant
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Built for Kenyan businesses that can't afford missed invoices or KRA penalties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary))]/40 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/5 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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