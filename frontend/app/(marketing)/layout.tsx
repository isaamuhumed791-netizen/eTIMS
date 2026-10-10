import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <LandingNav />
      <main className="flex-1 pt-16">{children}</main>
      <LandingFooter />
    </div>
  );
}