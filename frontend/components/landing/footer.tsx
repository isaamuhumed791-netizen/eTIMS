"use client";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useSupportSettings, mailtoSupport, whatsappSupport } from "@/lib/support";

export function LandingFooter() {
  const support = useSupportSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
                        <div className="mb-4"><Logo href="/" size={32} /></div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm">
              Automate every M-Pesa payment into a KRA-compliant eTIMS invoice â€” in real time.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--foreground))] mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Features</a></li>
              <li><a href="#how" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">How it works</a></li>
              <li><a href="#pricing" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Pricing</a></li>
              <li><a href="#faq" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">FAQ</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--foreground))] mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Sign in</Link></li>
              <li><Link href="/signup" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Create account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[hsl(var(--foreground))] mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={mailtoSupport(support.email)} className="inline-flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  <Mail className="h-3.5 w-3.5" /> {support.email}
                </a>
              </li>
              <li>
                <a href={whatsappSupport(support.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </li>
              {support.phoneDisplay && (
                <li>
                  <a href={`tel:${support.phoneDisplay.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <Phone className="h-3.5 w-3.5" /> {support.phoneDisplay}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[hsl(var(--border))] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          <div>Â© {year} Ristiflow. All rights reserved.</div>
          <div>{support.hours}</div>
        </div>
      </div>
    </footer>
  );
}