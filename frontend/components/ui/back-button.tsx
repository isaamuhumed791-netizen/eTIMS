"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  /** Fixed destination. If unset, uses browser history with a fallback. */
  href?: string;
  label?: string;
  className?: string;
  /** Where to go if there is no browser history (opened in new tab). Defaults to "/". */
  fallbackHref?: string;
}

export function BackButton({
  href,
  label = "Back",
  className = "",
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();

  const onClick = () => {
    if (href) return router.push(href);
    // If we have history, go back. Otherwise fall back.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || "Go back"}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label && <span>{label}</span>}
    </button>
  );
}