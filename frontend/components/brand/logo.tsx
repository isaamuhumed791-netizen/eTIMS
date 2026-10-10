import Link from "next/link";

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ href = "/", showText = true, size = 32, className = "" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 group ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ristiflow-logo.png"
        alt="Ristiflow"
        width={size}
        height={size}
        className="shrink-0 object-contain group-hover:scale-105 transition-transform"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="font-semibold tracking-tight">
          Risti<span className="text-[hsl(var(--primary))]">flow</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}