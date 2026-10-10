import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] bg-[hsl(var(--primary))]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))]/60 backdrop-blur px-3 py-1 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            KRA eTIMS + M-Pesa Daraja, fully automated
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Every M-Pesa payment,<br />
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500 bg-clip-text text-transparent">
              auto-invoiced to KRA
            </span>
          </h1>

          <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Ristiflow connects your M-Pesa Daraja account to KRA eTIMS.
            Receive a payment — a compliant invoice is submitted to KRA within seconds.
            No manual work. No missed invoices. No penalties.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--primary))]/20"
            >
              Start free — no card required
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3 text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              5-minute setup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              Encrypted credentials
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              Automatic retries
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}