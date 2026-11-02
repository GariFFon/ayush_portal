"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "cn"

import { useAuth } from "@/contexts/auth-context"
import { ArrowLeftIcon, BellIcon, HomeIcon, SidebarIcon } from "@/components/icons"
import { isActive, PAGE_TITLES, ROLE_HOME, ROLE_NAV } from "@/lib/nav"
import { useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const ICON_BTN =
  "relative flex size-10 shrink-0 items-center justify-center rounded-full border border-(--hairline) bg-card text-foreground outline-none transition-[background-color,transform] duration-150 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:scale-90 [&_svg]:size-[18px]"

function Hint({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Sticky header: sidebar toggle, Back, Home, sliding segmented nav, bell. Always visible. */
export function AppHeader() {
  const { user } = useAuth()
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const role = user?.role ?? "student"
  const home = ROLE_HOME[role]
  const links = ROLE_NAV[role]
  const title = PAGE_TITLES[pathname] ?? (pathname.startsWith("/internships/") ? "Internship details" : "CareerBridge")

  const navRef = React.useRef<HTMLElement>(null)
  const itemRefs = React.useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = React.useState<{ x: number; w: number } | null>(null)

  // Slide the lime segment under the active link (interruptible CSS transition).
  const measure = React.useCallback(() => {
    const active = links.find((l) => isActive(pathname, l))
    const el = active && itemRefs.current[active.href]
    setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
  }, [links, pathname])

  React.useEffect(() => {
    const raf = requestAnimationFrame(measure)
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    if (navRef.current) ro.observe(navRef.current)
    Object.values(itemRefs.current).forEach((el) => el && ro.observe(el))
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [measure])

  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push(home)
  }

  // Top-level pages only: skip duplicates that share an href.
  const topLinks = links.filter((l, i) => links.findIndex((x) => x.href === l.href) === i)

  return (
    <header className="glass-bar sticky top-0 z-30 flex h-[4.5rem] shrink-0 items-center gap-2 px-4 sm:px-6 lg:px-10">
      <Hint label="Menu">
        <button type="button" className={cn(ICON_BTN, "md:hidden")} aria-label="Open menu" onClick={toggleSidebar}>
          <SidebarIcon />
        </button>
      </Hint>
      <Hint label="Back">
        <button type="button" className={ICON_BTN} aria-label="Go back" onClick={goBack}>
          <ArrowLeftIcon />
        </button>
      </Hint>
      <Hint label="Home">
        <Link href={home} className={ICON_BTN} aria-label="Go to my dashboard">
          <HomeIcon />
        </Link>
      </Hint>

      <h2 className="ml-3 truncate text-[17px] leading-6 font-medium lg:hidden">{title}</h2>

      <nav
        ref={navRef}
        aria-label="Primary"
        className="relative mx-auto hidden min-w-0 gap-1 rounded-full border border-(--hairline) bg-card p-1 lg:flex"
      >
        {pill && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-lime transition-[transform,width] duration-[360ms] ease-(--ease-drawer)"
            style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
          />
        )}
        {topLinks.map((l) => {
          const active = isActive(pathname, l)
          return (
            <Link
              key={l.href}
              href={l.href}
              ref={(el) => {
                itemRefs.current[l.href] = el
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 shrink-0 rounded-full px-5 py-2 text-[14px] font-medium transition-[color,transform] duration-150 ease-(--ease-out) active:scale-[0.96]",
                active ? "text-(--on-lime)" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>

      <Hint label="Notifications">
        <button
          type="button"
          className={cn(ICON_BTN, "ml-auto lg:ml-0")}
          aria-label="Notifications"
          onClick={() => toast.success("You're all caught up", { description: "No new notifications right now." })}
        >
          <BellIcon />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>
      </Hint>
    </header>
  )
}
