import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ShellGate } from "@/components/shell-gate";

const interTight = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "CareerBridge — Academia–Industry Collaboration Portal",
  description:
    "SIH26044 | Connect students, universities, and companies through skill mapping, internship discovery, and placement analytics.",
  keywords: ["internship", "placement", "skill mapping", "academia", "industry", "CareerBridge"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={interTight.className}>
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <ShellGate>{children}</ShellGate>
              </Suspense>
            </AuthProvider>
            <Toaster position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
