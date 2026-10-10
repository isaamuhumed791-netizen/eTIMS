"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api, type MeResponse } from "@/lib/api";
import { LayoutDashboard, Settings, FileText, LogOut, Zap, MessageCircle, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { whatsappSupport } from "@/lib/support";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices",  label: "Invoices",  icon: FileText },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<MeResponse>("/auth/me")
      .then((r) => {
        setMe(r.data);
        const t = r.data.tenant;
        const isOnboarding = window.location.pathname.startsWith("/onboarding");
        if (!t.etimsConnectedAt && !t.mpesaConnectedAt && !isOnboarding) {
          router.push("/onboarding");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await api.post("/auth/logout");
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] text-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 animate-pulse text-[hsl(var(--primary))]" />
          Loading workspace...
        </div>
      </div>
    );
  }
  if (!me) return null;

  const initials = me.user.fullName
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const isAdmin = me.user.role === "ADMIN" || me.user.role === "SUPERADMIN";

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <aside className="w-64 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="h-16 px-5 flex items-center gap-2 border-b border-[hsl(var(--border))]">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
            <Zap className="h-4 w-4 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">eTIMS Middleware</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">{me.tenant.name}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[hsl(var(--border))] space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{me.user.fullName}</div>
              <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{me.user.email}</div>
            </div>
          </div>
          {isAdmin && (
            <Link
              href="/admin"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Shield className="h-4 w-4" /> Admin console
            </Link>
          )}
          <a
            href={whatsappSupport()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Get help
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-medium text-[hsl(var(--foreground))] capitalize">
              {pathname.replace("/", "").split("/")[0] || "dashboard"}
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}