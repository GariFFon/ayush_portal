"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/app-shell";

const SHELL_ROOTS = ["/dashboard", "/internships"];
const inRoot = (path: string, root: string) => path === root || path.startsWith(root + "/");

/**
 * Lives in the root layout so the sidebar + header stay mounted while you move
 * between dashboards and internships (no flicker, no re-animation).
 * /dashboard needs a session; /internships stays public for visitors.
 */
export function ShellGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const inShell = SHELL_ROOTS.some((r) => inRoot(pathname, r));
  const needsAuth = inRoot(pathname, "/dashboard");

  useEffect(() => {
    if (!loading && !user && needsAuth) router.push("/login");
  }, [loading, user, needsAuth, router]);

  if (!inShell) return <>{children}</>;

  if (loading || (!user && needsAuth)) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <AppShell>{children}</AppShell>;

  return <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">{children}</div>;
}
