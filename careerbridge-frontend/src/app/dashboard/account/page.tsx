"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useThemeRipple } from "@/lib/theme-ripple";
import { toast } from "sonner";
import { cn } from "cn";

import { useAuth } from "@/contexts/auth-context";
import { LogoutIcon, MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import { OrgAvatar, PageHeader, Panel, stagger } from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const THEMES = [
  { v: "light", label: "Light", Icon: SunIcon },
  { v: "dark", label: "Dark", Icon: MoonIcon },
  { v: "system", label: "System", Icon: MonitorIcon },
];

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Search pages and actions" },
  { keys: ["⌘", "B"], label: "Collapse or expand the sidebar" },
];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useThemeRipple();
  const router = useRouter();
  if (!user) return null;

  const name = user.full_name || user.username;

  return (
    <div className="space-y-8">
      <PageHeader title="Account" subtitle="Your details, appearance and shortcuts." />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="rise tone-lime tint dbl flex flex-col rounded-[32px] border p-7 [--r:32px] lg:col-span-5">
          <OrgAvatar name={name} className="size-16 text-lg" />
          <h2 className="mt-6 text-[2rem] leading-tight">{name}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{user.email}</p>
          <div className="mt-4">
            <Badge variant="violet" className="capitalize">{user.role}</Badge>
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-10">
            {user.role === "student" && (
              <Button size="lg" render={<Link href="/dashboard/student/profile" />} nativeButton={false}>
                Edit profile
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                logout();
                toast("Signed out");
                router.push("/");
              }}
            >
              <LogoutIcon /> Log out
            </Button>
          </div>
        </div>

        <Panel className="lg:col-span-7" title="Appearance" style={stagger(1)} contentClassName="space-y-4">
          <p className="text-[14px] text-muted-foreground">Choose how CareerBridge looks on this device.</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ v, label, Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setTheme(v)}
                aria-pressed={theme === v}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-[22px] border p-5 text-[14px] font-medium outline-none transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring",
                  theme === v ? "border-foreground/80 bg-secondary" : "border-(--hairline) hover:bg-secondary"
                )}
              >
                <Icon className="size-6" />
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Shortcuts" style={stagger(2)} contentClassName="stagger divide-y divide-border">
        {SHORTCUTS.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
            <span className="text-[14px]">{s.label}</span>
            <span className="flex gap-1.5">
              {s.keys.map((k) => (
                <kbd key={k} className="grid h-7 min-w-7 place-items-center rounded-lg border border-(--hairline) bg-secondary px-1.5 text-[12px] font-medium">
                  {k}
                </kbd>
              ))}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
