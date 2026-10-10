import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
            <Zap className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div className="text-lg font-semibold">eTIMS Middleware</div>
        </div>
        {children}
      </div>
    </div>
  );
}