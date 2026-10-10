"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Welcome back</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Sign in to your eTIMS dashboard</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        {error && <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2 rounded-lg">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-6 text-center">
        No account? <Link href="/signup" className="text-[hsl(var(--primary))] font-medium hover:underline">Create one</Link>
      </p>
    </div>
  );
}