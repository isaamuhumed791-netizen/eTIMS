import { Plug, Smartphone, FileCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Plug,
    title: "Connect in 2 minutes",
    description:
      "Sign up, enter your KRA PIN and Daraja keys. We fetch your CMC key and validate everything automatically — no code, no dev team needed.",
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Receive M-Pesa",
    description:
      "Your customers pay as usual via STK Push or Paybill. Ristiflow captures every callback, deduplicates it, and persists the transaction safely.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "KRA gets the invoice",
    description:
      "A compliant eTIMS sales invoice is submitted to KRA within seconds. Failed submissions retry automatically with exponential backoff.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--primary))] mb-3">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            From payment to compliance in three steps
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            No middleware to build. No developer to hire. Just connect and go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.number} className="relative">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <span className="text-2xl font-bold text-[hsl(var(--muted-foreground))]/30 tabular-nums">
                      {s.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {s.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]/40 z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}