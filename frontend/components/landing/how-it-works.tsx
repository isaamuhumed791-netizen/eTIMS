import { Plug, Smartphone, FileCheck } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Plug,
    title: "Enter your KRA PIN",
    time: "30 seconds",
    description:
      "We look up your business on KRA, generate a device serial, and fetch your CMC key automatically. No forms, no fax, no queue.",
    detail: "Example: P051234567X",
  },
  {
    number: "2",
    icon: Smartphone,
    title: "Paste your Daraja keys",
    time: "1 minute",
    description:
      "Consumer key, consumer secret, passkey. We validate them instantly against Safaricom. If they're wrong, we tell you why.",
    detail: "From developer.safaricom.co.ke",
  },
  {
    number: "3",
    icon: FileCheck,
    title: "Receive M-Pesa. KRA gets the invoice.",
    time: "Forever",
    description:
      "Every payment triggers a compliant eTIMS invoice in under 3 seconds. Failed submissions retry automatically — 3 attempts, exponential backoff.",
    detail: "Zero action required from you",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 border-t border-[hsl(var(--border))]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--primary))] mb-3">
            Setup
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Two minutes. Then it runs itself.
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            No middleware to build. No developer to hire. If you can fill out a login form, you can set this up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      Step {s.number}
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                      {s.time}
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed flex-1">
                  {s.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[hsl(var(--border))]">
                  <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">
                    {s.detail.startsWith("Example") ? "Format" : s.detail.startsWith("From") ? "Where to find it" : "What you do"}
                  </div>
                  <div className="text-xs font-mono text-[hsl(var(--foreground))] truncate">
                    {s.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}