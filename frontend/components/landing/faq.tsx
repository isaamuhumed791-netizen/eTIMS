"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need a developer to set this up?",
    a: "No. Sign up, enter your KRA PIN and M-Pesa Daraja keys — that's it. Our guided onboarding validates everything and connects your accounts in under 5 minutes.",
  },
  {
    q: "Is Ristiflow certified by KRA?",
    a: "We integrate directly with KRA's eTIMS API as a self-integrating taxpayer. Every invoice we submit is compliant and generates the required signature. We're pursuing formal KRA certification for wider distribution.",
  },
  {
    q: "What happens if KRA's servers are down?",
    a: "Failed submissions are queued and retried automatically with exponential backoff — up to 3 attempts per invoice. You'll see the status live on your dashboard and can manually retry anytime.",
  },
  {
    q: "How secure are my M-Pesa and KRA credentials?",
    a: "All credentials are encrypted at rest with AES-256-GCM. They're never logged, never exposed in the UI after saving, and are only decrypted in memory when submitting invoices to KRA.",
  },
  {
    q: "Does it work with Paybill and Buy Goods (Till)?",
    a: "Yes. Ristiflow supports both STK Push (customer-initiated) and Paybill/Till callbacks. Every successful payment triggers an eTIMS sales invoice automatically.",
  },
  {
    q: "What does it cost?",
    a: "Free while we're in beta — unlimited transactions and invoices. Pro ($20/mo) and Business ($50/mo) tiers launch soon with priority processing, multi-branch, and API access. Early adopters keep the Free tier forever.",
  },
  {
    q: "Can I export my invoices for accounting?",
    a: "Yes. Every invoice is stored with its KRA receipt number, SDC ID, and digital signature. You can view, filter, and export them from your dashboard at any time.",
  },
  {
    q: "What if I already use another eTIMS solution?",
    a: "You can run Ristiflow alongside or replace your current setup. We don't lock you in — the data is yours and exportable any time.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/40">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--primary))] mb-3">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Everything you need to know about Ristiflow.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[hsl(var(--accent))]/40 transition-colors"
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-0">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}