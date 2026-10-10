import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Logo href="/home" size={36} />
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}