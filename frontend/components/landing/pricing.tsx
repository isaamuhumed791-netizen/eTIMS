import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "KES 0",
    period: "forever",
    tagline: "For small businesses getting started with eTIMS.",
    cta: "Start free",
    href: "/signup",
    highlight: false,
    badge: "Available now",
    features: [
      "Unlimited M-Pesa transactions",
      "Unlimited KRA eTIMS invoices",
      "Automatic retries on failure",
      "Real-time dashboard",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$20",
    period: "per month",
    tagline: "For growing businesses that need priority processing.",
    cta: "Coming soon",
    href: "#",
    highlight: true,
    badge: "Coming soon",
    features: [
      "Everything in Free",
      "Priority queue (faster submissions)",
      "Multi-user access",
      "Custom support hours",
      "Detailed audit reports",
      "API access for POS integration",
    ],
  },
  {
    name: "Business",
    price: "$50",
    period: "per month",
    tagline: "For chains and multi-branch operations.",
    cta: "Coming soon",
    href: "#",
    highlight: false,
    badge: "Coming soon",
    features: [
      "Everything in Pro",
      "Unlimited branches",
      "Dedicated support line",
      "White-label options",
      "SLA + uptime guarantee",
      "Custom KRA reports",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--primary))] mb-3">
            Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Free while we're in beta
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Pro and Business tiers launch soon. Early adopters keep the Free tier forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                t.highlight
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--card))] shadow-xl shadow-[hsl(var(--primary))]/10"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.badge === "Available now"
                      ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  }`}>
                    {t.badge}
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{t.tagline}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">/ {t.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                    <span className="text-[hsl(var(--muted-foreground))]">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={t.href}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity ${
                  t.highlight
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
                    : t.badge === "Available now"
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90"
                    : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                }`}
                aria-disabled={t.badge === "Coming soon"}
              >
                {t.cta}
                {t.badge === "Available now" && <ArrowRight className="h-4 w-4" />}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-8">
          All plans include unlimited M-Pesa transactions and KRA eTIMS invoices. No hidden fees. Cancel anytime.
        </p>
      </div>
    </section>
  );
}