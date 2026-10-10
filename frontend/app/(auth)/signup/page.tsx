"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", businessName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(k: keyof typeof form, v: string) { setForm({ ...form, [k]: v }); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await api.post("/auth/signup", form);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string } } })?.response?.data;
      setError(data?.error || "Signup failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Start automating your eTIMS invoices</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full name</label>
          <input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Business name</label>
          <input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        {error && <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 px-3 py-2 rounded-lg">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-60 transition-opacity">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-6 text-center">
        Have an account? <Link href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}