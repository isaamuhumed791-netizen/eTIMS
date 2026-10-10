import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ristiflow — Automate M-Pesa into KRA eTIMS invoices",
  description:
    "Ristiflow connects your M-Pesa Daraja account to KRA eTIMS. Every payment becomes a compliant invoice automatically. Free while in beta.",
  keywords: ["eTIMS", "KRA", "M-Pesa", "Daraja", "invoicing", "Kenya", "tax compliance", "Ristiflow"],
  openGraph: {
    title: "Ristiflow — Automate M-Pesa into KRA eTIMS invoices",
    description:
      "Every M-Pesa payment becomes a compliant KRA eTIMS invoice — automatically, in real time.",
    type: "website",
    siteName: "Ristiflow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ristiflow — Automate M-Pesa into KRA eTIMS invoices",
    description: "Every M-Pesa payment becomes a compliant KRA eTIMS invoice — automatically.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}