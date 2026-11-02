"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "cn"

import { useAuth } from "@/contexts/auth-context"
import { getCompanyStats, getStudentStats } from "@/lib/api"
import {
  demoCompany,
  demoStudent,
  isEmptyCompany,
  isEmptyStudent,
  type CompanyStats,
  type StudentStats,
} from "@/lib/demo"
import { isActive, isChildActive, ROLE_NAV, type NavLink } from "@/lib/nav"
import { useThemeRipple } from "@/lib/theme-ripple"
import { useDashboardData } from "@/lib/use-dashboard-data"
import {
  BellIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobalIcon,
  LogoutIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  ProfileIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
} from "@/components/icons"
import { CommandMenu } from "@/components/command-menu"
import { OrgAvatar, STATUS_DOT } from "@/components/kit"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"

/* ── Live data for the sidebar (counts on the right, recent people) ──────── */
interface SidebarData {
  meta: Record<string, string | number | undefined>
  recent: { name: string; sub: string; status: string }[]
  recentTo: string
  recentAdd: string
}
const EMPTY: SidebarData = { meta: {}, recent: [], recentTo: "/", recentAdd: "/" }
const SidebarDataCtx = React.createContext<SidebarData>(EMPTY)

function StudentData({ children }: { children: React.ReactNode }) {
  const { data } = useDashboardData<StudentStats>(getStudentStats, demoStudent, isEmptyStudent)
  const value = React.useMemo<SidebarData>(
    () => ({
      meta: {
        "/dashboard/student/applications": data?.total_applications,
        "/dashboard/student/profile": data ? `${data.profile_completion}%` : undefined,
      },
      recent: (data?.recent_applications ?? []).slice(0, 3).map((a) => ({ name: a.company, sub: a.internship_title, status: a.status })),
      recentTo: "/dashboard/student/applications",
      recentAdd: "/internships",
    }),
    [data]
  )
  return <SidebarDataCtx.Provider value={value}>{children}</SidebarDataCtx.Provider>
}

function CompanyData({ children }: { children: React.ReactNode }) {
  const { data } = useDashboardData<CompanyStats>(getCompanyStats, demoCompany, isEmptyCompany)
  const value = React.useMemo<SidebarData>(
    () => ({
      meta: {
        "/dashboard/company/internships": data?.published_internships,
        "/dashboard/company/applicants": data?.total_applicants,
      },
      recent: (data?.recent_applications ?? []).slice(0, 3).map((a) => ({ name: a.student_name, sub: a.internship_title, status: a.status })),
      recentTo: "/dashboard/company/applicants",
      recentAdd: "/dashboard/company/internships/create",
    }),
    [data]
  )
  return <SidebarDataCtx.Provider value={value}>{children}</SidebarDataCtx.Provider>
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const LABEL = "px-3 pt-6 pb-2.5 text-[11px] font-medium tracking-[0.09em] text-muted-foreground uppercase group-data-[collapsible=icon]:hidden"
const ROW =
  "group/row relative flex h-[3.25rem] w-full shrink-0 items-center gap-3.5 rounded-[20px] pr-3 pl-1.5 text-[15px] text-muted-foreground outline-none transition-[background-color,color,transform] duration-200 hover:bg-secondary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.985] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:hover:bg-transparent"
const TILE =
  "flex size-10 shrink-0 items-center justify-center rounded-[14px] transition-[background-color,color,box-shadow,transform] duration-200 group-data-[collapsible=icon]:size-12 [&_svg]:size-5"
const TILE_OFF = "bg-secondary/80 text-muted-foreground group-hover/row:bg-secondary group-hover/row:text-foreground"
const TILE_ON = "bg-primary text-primary-foreground shadow-[0_8px_16px_-8px_var(--glass-shadow)]"
const TEXT = "truncate group-data-[collapsible=icon]:hidden"

function Tile({ Icon, active, children }: { Icon: NavLink["icon"]; active: boolean; children?: React.ReactNode }) {
  return (
    <span className={cn(TILE, active ? TILE_ON : TILE_OFF)}>
      <Icon />
      {children}
    </span>
  )
}

function Meta({ children, tone }: { children: React.ReactNode; tone?: "alert" }) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full px-2.5 py-1 text-[11.5px] leading-none font-medium tabular-nums group-data-[collapsible=icon]:hidden",
        tone === "alert" ? "bg-(--pink-bg) text-(--pink-fg)" : "bg-secondary text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-lime", className)}>
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18h18" />
        <path d="M5.5 18c0-5.2 2.9-9 6.5-9s6.5 3.8 6.5 9" />
        <path d="M12 9V5" />
      </svg>
    </span>
  )
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
export function AppSidebar() {
  const { user } = useAuth()
  const Provider = user?.role === "student" ? StudentData : user?.role === "company" ? CompanyData : React.Fragment
  return (
    <Provider>
      <SidebarView />
    </Provider>
  )
}

function SidebarView() {
  const { user } = useAuth()
  const pathname = usePathname()
  const { toggleSidebar, state, isMobile } = useSidebar()
  const data = React.useContext(SidebarDataCtx)
  const links = ROLE_NAV[user?.role ?? "student"]
  const collapsed = state === "collapsed" && !isMobile
  const [cmdOpen, setCmdOpen] = React.useState(false)

  return (
    <>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader className="px-5 pt-6 pb-2 group-data-[collapsible=icon]:px-2">
          <Link href="/" className="flex items-center gap-3.5 rounded-2xl transition-transform duration-150 active:scale-[0.97] group-data-[collapsible=icon]:justify-center">
            <BrandMark />
            <span className="leading-tight group-data-[collapsible=icon]:hidden">
              <span className="block text-[18px] font-semibold tracking-tight">CareerBridge</span>
              <span className="block text-[11.5px] text-muted-foreground">Placement portal</span>
            </span>
          </Link>
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="absolute top-7 -right-3.5 z-30 flex size-7 items-center justify-center rounded-full border border-(--hairline) bg-card text-muted-foreground shadow-sm transition-[transform,color] duration-150 hover:text-foreground active:scale-90"
            >
              {collapsed ? <ChevronRightIcon className="size-4" /> : <ChevronLeftIcon className="size-4" />}
            </button>
          )}
        </SidebarHeader>

        <SidebarContent className="min-h-0 gap-0 overflow-x-hidden px-4 pt-4 group-data-[collapsible=icon]:px-2">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex h-12 w-full shrink-0 items-center gap-3 rounded-[20px] border border-(--hairline) bg-card px-4 text-[15px] text-muted-foreground transition-[background-color,transform] duration-150 hover:bg-secondary active:scale-[0.985] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0"
          >
            <SearchIcon className="size-5 shrink-0" />
            <span className={cn(TEXT, "flex-1 text-left")}>Search</span>
            <span className="flex gap-1 group-data-[collapsible=icon]:hidden">
              <kbd className="grid h-6 min-w-6 place-items-center rounded-md border border-(--hairline) bg-secondary px-1 text-[11px] font-medium">⌘</kbd>
              <kbd className="grid h-6 min-w-6 place-items-center rounded-md border border-(--hairline) bg-secondary px-1 text-[11px] font-medium">K</kbd>
            </span>
          </button>

          <div className="mx-3 my-4 hidden border-t border-border group-data-[collapsible=icon]:block" />
          <p className={LABEL}>Main</p>
          <nav className="flex flex-col gap-1.5 group-data-[collapsible=icon]:gap-2">
            {links.map((l) => (
              <NavRow key={l.href + l.label} link={l} pathname={pathname} collapsed={collapsed} meta={data.meta[l.href]} />
            ))}
            <button
              type="button"
              className={ROW}
              onClick={() => toast.success("You're all caught up", { description: "No new notifications right now." })}
            >
              <Tile Icon={BellIcon} active={false}>
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-sidebar" />
              </Tile>
              <span className={TEXT}>Notifications</span>
            </button>
          </nav>

          <RecentList collapsed={collapsed} />
        </SidebarContent>

        <SidebarFooter className="shrink-0 p-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
          <UserCard collapsed={collapsed} />
        </SidebarFooter>
      </Sidebar>
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  )
}

/* ── One nav row; with children it becomes an animated tree (or a flyout when collapsed) ── */
function NavRow({ link, pathname, collapsed, meta }: { link: NavLink; pathname: string; collapsed: boolean; meta?: string | number }) {
  const Icon = link.icon
  const active = isActive(pathname, link)
  const [open, setOpen] = React.useState(active)

  if (!link.children) {
    return (
      <Link href={link.href} aria-current={active ? "page" : undefined} className={cn(ROW, active && "text-foreground")} title={collapsed ? link.label : undefined}>
        <Tile Icon={Icon} active={active} />
        <span className={cn(TEXT, active && "font-semibold")}>{link.label}</span>
        {meta !== undefined && <Meta>{meta}</Meta>}
      </Link>
    )
  }

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" aria-label={link.label} className={cn(ROW, active && "text-foreground")} />}>
          <Tile Icon={Icon} active={active} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={16} className="min-w-48">
          {link.children.map((c) => (
            <DropdownMenuItem key={c.href} render={<Link href={c.href} />} className={cn(isChildActive(pathname, c) && "bg-secondary font-medium")}>
              {c.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={cn(ROW, active && "text-foreground")}>
        <Tile Icon={Icon} active={active} />
        <span className={cn(TEXT, "flex-1 text-left", active && "font-semibold")}>{link.label}</span>
        {meta !== undefined && <Meta>{meta}</Meta>}
        <ChevronDownIcon className={cn("size-4 shrink-0 transition-transform duration-300 ease-(--ease-drawer)", !meta && "ml-auto", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-(--ease-drawer)", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <ul className="overflow-hidden">
          <div className="pt-1 pb-1.5 pl-[2.05rem]">
            {link.children.map((c) => {
              const on = isChildActive(pathname, c)
              return (
                <li
                  key={c.href}
                  className="relative pl-7 before:absolute before:top-0 before:left-0 before:h-1/2 before:w-5 before:rounded-bl-xl before:border-b before:border-l before:border-border not-last:after:absolute not-last:after:top-1/2 not-last:after:bottom-0 not-last:after:left-0 not-last:after:border-l not-last:after:border-border"
                >
                  <Link
                    href={c.href}
                    tabIndex={open ? 0 : -1}
                    className={cn(
                      "flex h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] transition-colors duration-150 hover:bg-secondary/60 hover:text-foreground",
                      on ? "font-medium text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full transition-colors duration-200", on ? "bg-foreground" : "bg-foreground/20")} />
                    {c.label}
                  </Link>
                </li>
              )
            })}
          </div>
        </ul>
      </div>
    </div>
  )
}

/* ── Recent people ───────────────────────────────────────────────────────── */
function RecentList({ collapsed }: { collapsed: boolean }) {
  const { recent, recentTo, recentAdd } = React.useContext(SidebarDataCtx)
  if (recent.length === 0) return null
  return (
    <div className="mt-2">
      <div className="mx-1 mt-3 mb-1 border-t border-border group-data-[collapsible=icon]:mx-2" />
      <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
        <p className={LABEL}>Recent</p>
        <Link href={recentAdd} aria-label="Add" className="mt-4 mr-1 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-secondary hover:text-foreground active:scale-90">
          <PlusIcon className="size-5" />
        </Link>
      </div>
      <ul className="flex flex-col gap-1 group-data-[collapsible=icon]:mt-3">
        {recent.map((p) => (
          <li key={p.name}>
            <Link href={recentTo} title={collapsed ? p.name : undefined} className={cn(ROW, "h-[3.5rem]")}>
              <span className="relative shrink-0">
                <OrgAvatar name={p.name} className="size-10 group-data-[collapsible=icon]:size-11" />
                <span className={cn("absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-sidebar", STATUS_DOT[p.status] ?? "bg-muted-foreground")} />
              </span>
              <span className={cn(TEXT, "flex-1 text-left leading-tight")}>
                <span className="block truncate text-[14.5px] text-foreground">{p.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{p.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── User card: avatar + name open your profile; the chevron opens the menu ── */
function UserCard({ collapsed }: { collapsed: boolean }) {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useThemeRipple()
  const router = useRouter()
  if (!user) return null

  const name = user.full_name || user.username
  const initials = ((user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? user.username?.[0] ?? "")).toUpperCase()
  const profileHref = user.role === "student" ? "/dashboard/student/profile" : "/dashboard/account"
  const themes = [
    { v: "light", label: "Light", Icon: SunIcon },
    { v: "dark", label: "Dark", Icon: MoonIcon },
    { v: "system", label: "System", Icon: MonitorIcon },
  ]

  return (
    <div className="flex items-center gap-1 rounded-[26px] border border-(--hairline) bg-card p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:rounded-[24px] group-data-[collapsible=icon]:p-1.5">
      <Link
        href={profileHref}
        title="Open profile"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] p-1 text-left outline-none transition-[background-color,transform] duration-150 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:p-0"
      >
        <Avatar className="size-11 shrink-0 rounded-2xl after:rounded-2xl">
          <AvatarImage src={user.profile_photo ?? ""} alt={name} className="rounded-2xl" />
          <AvatarFallback className="tone-lime rounded-2xl bg-(--t-bg) text-sm font-semibold text-(--t-fg)">{initials}</AvatarFallback>
        </Avatar>
        <span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-[14.5px] font-semibold">{name}</span>
          <span className="truncate text-[10.5px] font-medium tracking-[0.08em] text-muted-foreground uppercase">{user.role}</span>
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90 aria-expanded:bg-secondary aria-expanded:text-foreground"
        >
          <ChevronDownIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64" side={isMobile || !collapsed ? "top" : "right"} align={collapsed && !isMobile ? "end" : "start"} sideOffset={12}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3.5 py-2.5 font-normal">
              <span className="block truncate text-[14px] font-semibold">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href={profileHref} />}>
            <ProfileIcon /> {user.role === "student" ? "My profile" : "Account"}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/account" />}>
            <SettingsIcon /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {themes.map(({ v, label, Icon }) => (
            <DropdownMenuItem key={v} onClick={() => setTheme(v)}>
              <Icon />
              {label}
              {theme === v && <span className="ml-auto size-1.5 rounded-full bg-foreground" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/" />}>
            <GlobalIcon /> Website
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              logout()
              toast("Signed out")
              router.push("/")
            }}
          >
            <LogoutIcon /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
