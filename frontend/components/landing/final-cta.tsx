import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 border-t border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl border border-[hsl(var(--primary))]/20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] bg-[hsl(var(--primary))]/30 blur-[100px] rounded-full" />
          </div>

          <div className="relative bg-[hsl(var(--card))]/60 backdrop-blur px-8 py-16 md:px-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))]/60 px-3 py-1 text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
              Free while we're in beta
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl mx-auto">
              Stop worrying about KRA.{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500 bg-clip-text text-transparent">
                Start growing.
              </span>
            </h2>

            <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
              Connect in 5 minutes. Every M-Pesa payment becomes a compliant KRA invoice — automatically, forever.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--primary))]/20"
              >
                Start free — no card required
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3 text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}