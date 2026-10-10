"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api, type MeResponse } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard, Users, AlertOctagon, ScrollText, ListChecks,
  Settings as SettingsIcon, Terminal, LogOut, Shield, Zap,
} from "lucide-react";

const nav = [
  { href: "/admin",            label: "Overview",  icon: LayoutDashboard },
  { href: "/admin/tenants",    label: "Tenants",   icon: Users },
  { href: "/admin/errors",     label: "Errors",    icon: AlertOctagon },
  { href: "/admin/logs",       label: "Live logs", icon: Terminal },
  { href: "/admin/queue",      label: "Queue",     icon: ListChecks },
  { href: "/admin/audit",      label: "Audit",     icon: ScrollText },
  { href: "/admin/settings",   label: "Settings",  icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    api.get<MeResponse>("/auth/me")
      .then((r) => {
        const role = r.data.user.role;
        if (role !== "ADMIN" && role !== "SUPERADMIN") {
          setDenied(true);
          setTimeout(() => router.push("/dashboard"), 2000);
          return;
        }
        setMe(r.data);
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
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Shield className="h-4 w-4 animate-pulse text-red-500" />
          Verifying admin access…
        </div>
      </div>
    );
  }
  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-5 text-center">
          <div className="text-sm font-medium text-red-500">Access denied</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Redirecting to dashboard…</div>
        </div>
      </div>
    );
  }
  if (!me) return null;

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-red-500/20 bg-[hsl(var(--card))]">
        <div className="h-16 px-5 flex items-center gap-2 border-b border-red-500/20">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Admin Console</div>
            <div className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">
              {me.user.role}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-red-500/10 text-red-500 font-medium"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-red-500/20 space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Zap className="h-3.5 w-3.5" /> Back to tenant app
          </Link>
          <div className="px-3 py-2">
            <div className="text-xs font-medium truncate">{me.user.fullName}</div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{me.user.email}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">
              Admin
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] capitalize">
              {pathname.replace("/admin", "").replace("/", " ").trim() || "overview"}
            </div>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}