"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"

import { useAuth } from "@/contexts/auth-context"
import { GlobalIcon, LogoutIcon, MoonIcon, SearchIcon } from "@/components/icons"
import { ROLE_NAV } from "@/lib/nav"
import { useThemeRipple } from "@/lib/theme-ripple"

interface Cmd {
  id: string
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
}

/** ⌘K / Ctrl+K command palette: jump to any page or run an action. */
export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useThemeRipple()
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [router, onOpenChange]
  )

  const all = React.useMemo<Cmd[]>(() => {
    const links = ROLE_NAV[user?.role ?? "student"]
    const pages: Cmd[] = links.flatMap((l) => {
      const Icon = l.icon
      const base: Cmd = { id: l.href + l.label, label: l.label, hint: "Page", icon: <Icon className="size-[18px]" />, run: () => go(l.href) }
      const kids: Cmd[] = (l.children ?? [])
        .filter((c) => c.href !== l.href)
        .map((c) => ({ id: c.href, label: `${l.label} · ${c.label}`, hint: "Page", icon: <Icon className="size-[18px]" />, run: () => go(c.href) }))
      return [base, ...kids]
    })
    return [
      ...pages,
      { id: "site", label: "Open website", hint: "Action", icon: <GlobalIcon className="size-[18px]" />, run: () => go("/") },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        hint: "Action",
        icon: <MoonIcon className="size-[18px]" />,
        run: () => {
          setTheme(theme === "dark" ? "light" : "dark")
          onOpenChange(false)
        },
      },
      {
        id: "logout",
        label: "Log out",
        hint: "Action",
        icon: <LogoutIcon className="size-[18px]" />,
        run: () => {
          logout()
          onOpenChange(false)
          router.push("/")
        },
      },
    ]
  }, [user?.role, go, theme, setTheme, onOpenChange, logout, router])

  const results = all.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()))

  // Global shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      results[active]?.run()
    } else if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]" role="dialog" aria-modal="true" aria-label="Search">
      <button
        aria-label="Close search"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] animate-in fade-in duration-150"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-(--hairline) bg-popover shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <SearchIcon className="size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onInputKey}
            placeholder="Search pages and actions…"
            className="w-full bg-transparent text-[16px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-lg border border-(--hairline) bg-secondary px-2 py-1 text-[11px] text-muted-foreground">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No results</li>}
          {results.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={c.run}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] transition-colors duration-100",
                  i === active ? "bg-secondary" : ""
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-card text-foreground ring-1 ring-(--hairline)">{c.icon}</span>
                <span className="flex-1 font-medium">{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
