import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, FileCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              KRA requires eTIMS on every sale
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-tight leading-[1.1]">
              Every missed invoice is a{" "}
              <span className="text-red-500">fine waiting to happen.</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl">
              Ristiflow turns every M-Pesa payment into a KRA-accepted eTIMS invoice
              in <span className="font-medium text-[hsl(var(--foreground))]">under 3 seconds</span>.
              No spreadsheets. No manual entries. No late nights reconciling.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
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

            {/* Live status strip — replaces the generic "3 checkmarks" */}
            <div className="mt-10 pt-8 border-t border-[hsl(var(--border))] grid grid-cols-3 gap-6 max-w-md">
              <Stat value="< 3s" label="invoice latency" />
              <Stat value="3×" label="auto-retry on failure" />
              <Stat value="AES-256" label="credentials encrypted" />
            </div>
          </div>

          {/* RIGHT: Product mock */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[hsl(var(--primary))]/10 to-transparent blur-3xl rounded-full" />

            <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl shadow-black/20 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <div className="ml-3 text-[11px] text-[hsl(var(--muted-foreground))] font-mono">
                  ristiflow — live feed
                </div>
              </div>

              {/* Transactions */}
              <div className="divide-y divide-[hsl(var(--border))]">
                <TxRow
                  receipt="QK389922"
                  phone="254712345678"
                  amount="KES 250.00"
                  kra="#KRA-0884921"
                />
                <TxRow
                  receipt="QK389918"
                  phone="254708374149"
                  amount="KES 1,200.00"
                  kra="#KRA-0884918"
                />
                <TxRow
                  receipt="QK389901"
                  phone="254722456789"
                  amount="KES 75.00"
                  kra="#KRA-0884901"
                />
              </div>

              {/* Footer strip */}
              <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[hsl(var(--success))]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All invoices accepted by KRA
                </div>
                <div className="text-[hsl(var(--muted-foreground))] font-mono">
                  auto-syncing
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 hidden md:flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-xl">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Connected</div>
                <div className="text-xs font-medium">M-Pesa → KRA eTIMS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-lg font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{label}</div>
    </div>
  );
}

function TxRow({
  receipt, phone, amount, kra,
}: {
  receipt: string;
  phone: string;
  amount: string;
  kra: string;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-[hsl(var(--success))]/10 flex items-center justify-center shrink-0">
        <FileCheck className="h-4 w-4 text-[hsl(var(--success))]" />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-3 gap-3 items-center text-xs">
        <div className="min-w-0">
          <div className="font-mono text-[hsl(var(--foreground))] truncate">{receipt}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">{phone}</div>
        </div>
        <div className="text-right font-medium tabular-nums">{amount}</div>
        <div className="text-right">
          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">KRA</div>
          <div className="font-mono text-[10px] text-[hsl(var(--primary))] truncate">{kra}</div>
        </div>
      </div>
    </div>
  );
}