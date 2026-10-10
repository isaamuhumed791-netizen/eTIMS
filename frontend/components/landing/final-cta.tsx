import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 border-t border-[hsl(var(--border))]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-8 py-16 md:px-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Set it up now. Forget about it.
              </h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))] text-base leading-relaxed">
                Free while we're in beta — no card, no lock-in. If you don't like it,
                export your data and walk away. If you do, you'll never think about
                KRA invoices again.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-3 text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 lg:pl-8 lg:border-l border-[hsl(var(--border))]">
              <ul className="space-y-3">
                <Check>Setup takes 2 minutes</Check>
                <Check>Free while in beta</Check>
                <Check>Export your data anytime</Check>
                <Check>No developer required</Check>
                <Check>Support over WhatsApp and email</Check>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-2" />
      {children}
    </li>
  );
}