"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/brand/logo";
import { api, type MeResponse } from "@/lib/api";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how",      label: "How it works" },
  { href: "#pricing",  label: "Pricing" },
  { href: "#faq",      label: "FAQ" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detect if user is logged in
  useEffect(() => {
    api.get<MeResponse>("/auth/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null))
      .finally(() => setCheckedAuth(true));
  }, []);

  const isDark = mounted && (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-lg bg-[hsl(var(--background))]/80 border-b border-[hsl(var(--border))]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo href="/home" size={32} />

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors"
          >
            {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4 opacity-0" />}
          </button>

          {checkedAuth && me ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 hover:opacity-90 transition-opacity"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden h-9 w-9 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <div className="px-6 py-4 space-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[hsl(var(--border))] flex gap-2">
              {checkedAuth && me ? (
                <Link
                  href="/dashboard"
                  className="flex-1 text-center text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 text-center text-sm rounded-lg border border-[hsl(var(--border))] px-4 py-2">
                    Sign in
                  </Link>
                  <Link href="/signup" className="flex-1 text-center text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2">
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}