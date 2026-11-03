"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "cn"

import { useAuth } from "@/contexts/auth-context"
import {
  ApplicationsIcon,
  ArrowRightIcon,
  BellIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseCircleIcon,
  GlobalIcon,
  SettingsIcon,
  StarIcon,
} from "@/components/icons"
import { OrgAvatar, TickProgress } from "@/components/kit"

/* ── Catalogue ───────────────────────────────────────────────────────────── */
type Tab = "all" | "applications" | "jobs" | "messages" | "alerts"
type Kind =
  | "offer" | "interview" | "shortlisted" | "closed" | "applicant"
  | "message" | "match" | "deadline" | "listing"
  | "tip" | "security" | "system"

interface Item {
  id: string
  kind: Kind
  tab: Exclude<Tab, "all">
  role: "student" | "company" | "both"
  actor?: string
  text: string
  target?: string
  time: string
  meta: string
  unread?: boolean
}

const CATALOGUE: Item[] = [
  { id: "n1", kind: "offer", tab: "applications", role: "student", actor: "Orbit Systems", text: "sent you an offer for", target: "Backend Intern", time: "2h", meta: "Offer", unread: true },
  { id: "n2", kind: "interview", tab: "applications", role: "student", actor: "Zoho Corporation", text: "invited you to interview for", target: "Frontend Developer Intern", time: "5h", meta: "Interview", unread: true },
  { id: "n3", kind: "message", tab: "messages", role: "both", actor: "Priya Nair", text: "replied to your application at", target: "Freshworks", time: "9h", meta: "Message", unread: true },
  { id: "n4", kind: "shortlisted", tab: "applications", role: "student", actor: "Nova Tech", text: "shortlisted you for", target: "Frontend Intern", time: "1d", meta: "Status" },
  { id: "n5", kind: "match", tab: "jobs", role: "student", text: "A new role matches your skills:", target: "Data Analyst Intern", time: "2d", meta: "Job match" },
  { id: "n6", kind: "deadline", tab: "jobs", role: "student", actor: "Freshworks", text: "closes applications for", target: "Backend Engineer Intern", time: "2d", meta: "Deadline" },
  { id: "n7", kind: "applicant", tab: "applications", role: "company", actor: "Liam Kapoor", text: "applied to", target: "Data Analyst Intern", time: "1h", meta: "New applicant", unread: true },
  { id: "n8", kind: "listing", tab: "jobs", role: "company", text: "Your listing is about to expire:", target: "Frontend Developer Intern", time: "3h", meta: "Listing" },
  { id: "n9", kind: "tip", tab: "alerts", role: "student", text: "Finish your profile to", target: "rank higher in matches", time: "3d", meta: "Tip" },
  { id: "n10", kind: "closed", tab: "applications", role: "student", actor: "Quanta AI", text: "closed your application for", target: "ML Intern", time: "4d", meta: "Closed" },
  { id: "n11", kind: "security", tab: "alerts", role: "both", text: "New sign-in to your account", target: "", time: "Now", meta: "Security", unread: true },
  { id: "n12", kind: "system", tab: "alerts", role: "both", text: "Scheduled maintenance on", target: "Sunday, 2:00–3:00 AM", time: "1w", meta: "System" },
]

const KIND_LABEL: Record<Kind, string> = {
  offer: "Offer", interview: "Interview invite", shortlisted: "Status update", closed: "Rejection", applicant: "New applicant",
  message: "Message", match: "Job match", deadline: "Deadline", listing: "Listing alert", tip: "Profile tip", security: "Security alert", system: "System notice",
}

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "applications", label: "Applications" },
  { id: "jobs", label: "Jobs" },
  { id: "messages", label: "Messages" },
  { id: "alerts", label: "Alerts" },
]


/* ── Outcomes: what a card (and the toast) says after you act, coloured by what happened ── */
type Glyph = "check" | "cross" | "calendar" | "clock" | "send" | "bookmark" | "star" | "shield"
interface Outcome { title: string; sub: string; tone: string; glyph: Glyph }

const OUT: Record<string, Outcome> = {
  accept: { title: "Offer accepted", sub: "Orbit Systems will send onboarding details shortly.", tone: "tone-mint", glyph: "check" },
  decline: { title: "Offer declined", sub: "Orbit Systems has been told. Your other applications are unaffected.", tone: "tone-pink", glyph: "cross" },
  confirm: { title: "Interview confirmed", sub: "Thursday, 6 Nov · 11:00 AM — added to your calendar.", tone: "tone-blue", glyph: "calendar" },
  reschedule: { title: "New time requested", sub: "Zoho Corporation will suggest other slots soon.", tone: "tone-amber", glyph: "clock" },
  reply: { title: "Reply sent", sub: "Priya will see it right away.", tone: "tone-violet", glyph: "send" },
  save: { title: "Saved to your list", sub: "Find it any time under Saved jobs.", tone: "tone-peach", glyph: "bookmark" },
  shortlist: { title: "Candidate shortlisted", sub: "Liam Kapoor moved to your shortlist.", tone: "tone-violet", glyph: "star" },
  candDecline: { title: "Application closed", sub: "Liam Kapoor will be notified politely.", tone: "tone-pink", glyph: "cross" },
  expire: { title: "Listing will expire", sub: "It closes on its deadline as planned.", tone: "tone-mist", glyph: "clock" },
  extend: { title: "Deadline extended", sub: "The listing stays open for 14 more days.", tone: "tone-mint", glyph: "clock" },
  notMe: { title: "Session signed out", sub: "Change your password to keep your account safe.", tone: "tone-pink", glyph: "shield" },
  itsMe: { title: "Thanks for confirming", sub: "We’ll remember this device.", tone: "tone-mint", glyph: "shield" },
}

function GlyphIcon({ glyph, className }: { glyph: Glyph; className?: string }) {
  const I = { check: CheckCircleIcon, cross: CloseCircleIcon, calendar: CalendarIcon, clock: ClockIcon, send: ArrowRightIcon, bookmark: BookmarkIcon, star: StarIcon, shield: BellIcon }[glyph]
  return <I className={className} />
}

/** The badge: a white disc with the glyph, and a soft ring that pulses once. */
function OutcomeBadge({ o, size = "md" }: { o: Outcome; size?: "md" | "lg" }) {
  return (
    <span className={cn(o.tone, "relative flex shrink-0 items-center justify-center rounded-full bg-card text-(--t-fg) shadow-[0_6px_16px_-8px_oklch(0.2_0.06_280/0.35)]", size === "lg" ? "size-12" : "size-11")}>
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-(--t-fg)/20 [animation-iteration-count:1] [animation-duration:900ms]" />
      <GlyphIcon glyph={o.glyph} className="relative size-[22px]" />
    </span>
  )
}

/** Shown inside the card in place of its buttons. */
function Confirmed({ o, onUndo }: { o: Outcome; onUndo: () => void }) {
  return (
    <div
      className={cn(
        o.tone,
        "mt-3.5 flex animate-in items-center gap-3.5 rounded-[20px] bg-(--t-bg) p-3.5 pr-4 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.55)] duration-300 fade-in-0 zoom-in-95 slide-in-from-bottom-1"
      )}
      role="status"
    >
      <OutcomeBadge o={o} />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] leading-snug font-medium text-(--t-fg)">{o.title}</p>
        <p className="mt-0.5 text-[14px] leading-snug text-foreground/65">{o.sub}</p>
      </div>
      <button type="button" onClick={onUndo} className="shrink-0 rounded-full px-3 py-1.5 text-[13.5px] font-medium text-(--t-fg) outline-none transition-[background-color,transform] duration-150 hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-ring active:scale-95">
        Undo
      </button>
    </div>
  )
}

/** The pop-up toast: same colours and badge as the card. */
function showOutcomeToast(o: Outcome) {
  toast.custom(
    () => (
      <div className={cn(o.tone, "flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3.5 rounded-[26px] border border-(--hairline) bg-card p-3 pr-5 shadow-[0_24px_48px_-20px_oklch(0.2_0.06_280/0.45),0_2px_6px_oklch(0.2_0.06_280/0.06)]")}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-(--t-bg) text-(--t-fg)">
          <GlyphIcon glyph={o.glyph} className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[15.5px] leading-snug font-medium text-foreground">{o.title}</p>
          <p className="mt-0.5 text-[13.5px] leading-snug text-muted-foreground">{o.sub}</p>
        </div>
      </div>
    ),
    { duration: 4200, position: "bottom-right", unstyled: true, classNames: { toast: "!border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none" } }
  )
}

/* ── Building blocks ─────────────────────────────────────────────────────── */
const BTN_DARK =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-[14.5px] font-medium text-primary-foreground outline-none transition-[transform,opacity] duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
const BTN_GHOST =
  "inline-flex h-10 items-center justify-center rounded-full px-4 text-[14.5px] font-medium text-foreground/75 outline-none transition-[transform,background-color,color] duration-150 hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95"

/** The tinted inset each card keeps its content in. */
function Inset({ tone, className, children }: { tone: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(tone, "mt-3.5 rounded-[20px] bg-(--t-bg) p-4 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.55)]", className)}>{children}</div>
  )
}

function Ring({ value, size = 48, color = "var(--c-mint)" }: { value: number; size?: number; color?: string }) {
  const r = (size - 7) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" className="stroke-foreground/10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" strokeLinecap="round" stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute text-[13px] font-semibold tabular-nums">{value}</span>
    </span>
  )
}

function IconTile({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={cn(tone, "flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-(--t-bg) text-(--t-fg) [&_svg]:size-5")}>{children}</span>
}

function Avatar({ item }: { item: Item }) {
  if (item.actor && !["security", "system"].includes(item.kind)) return <OrgAvatar name={item.actor} className="size-10" />
  const map: Partial<Record<Kind, [React.ReactNode, string]>> = {
    match: [<StarIcon key="i" />, "tone-violet"],
    tip: [<CheckCircleIcon key="i" />, "tone-mint"],
    listing: [<ClockIcon key="i" />, "tone-amber"],
    security: [<BellIcon key="i" />, "tone-amber"],
    system: [<SettingsIcon key="i" />, "tone-mist"],
  }
  const [icon, tone] = map[item.kind] ?? [<BellIcon key="i" />, "tone-blue"]
  return <IconTile tone={tone}>{icon}</IconTile>
}

/** Each type has its own face, so you know what it is before you read it. */
function Body({ item, done, act, undo }: { item: Item; done: Outcome | null; act: (key: string) => void; undo: () => void }) {
  if (done) return <Confirmed o={done} onUndo={undo} />
  switch (item.kind) {
    case "offer":
      return (
        <>
          <Inset tone="tone-mint">
            <p className="text-[13px] font-medium tracking-[0.08em] text-(--t-fg) uppercase">Monthly stipend</p>
            <p className="mt-1 text-[2.5rem] leading-none font-light tracking-[-0.05em] text-foreground tabular-nums">
              ₹30,000<span className="ml-1 text-[16px] tracking-normal text-muted-foreground">/mo · 6 months</span>
            </p>
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-card/80 px-3.5 py-2.5">
              <ApplicationsIcon className="size-[18px] text-(--t-fg)" />
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">Offer-letter.pdf</span>
              <span className="text-[13px] text-muted-foreground">184 KB</span>
            </div>
            <TickProgress value={70} ticks={32} color="var(--c-mint)" className="mt-4 h-5" />
            <p className="mt-2 text-[13.5px] text-muted-foreground">Respond within 5 days</p>
          </Inset>
          <div className="mt-3.5 flex items-center justify-end gap-1.5">
            <button type="button" className={BTN_GHOST} onClick={() => act("decline")}>Decline</button>
            <button type="button" className={cn(BTN_DARK, "min-w-32")} onClick={() => act("accept")}>Accept offer</button>
          </div>
        </>
      )
    case "interview":
      return (
        <>
          <Inset tone="tone-blue" className="flex items-stretch p-0">
            <div className="flex w-24 shrink-0 flex-col items-center justify-center py-4 leading-none text-(--t-fg)">
              <span className="text-[11.5px] font-medium tracking-[0.14em] uppercase">Thu</span>
              <span className="mt-1.5 text-[2.5rem] font-light tracking-[-0.04em]">6</span>
              <span className="mt-1.5 text-[11.5px] font-medium tracking-[0.14em] uppercase">Nov</span>
            </div>
            <div aria-hidden className="relative w-0 self-stretch border-l-2 border-dashed border-foreground/15">
              <span className="absolute -top-2.5 -left-[11px] size-5 rounded-full bg-card" />
              <span className="absolute -bottom-2.5 -left-[11px] size-5 rounded-full bg-card" />
            </div>
            <div className="min-w-0 flex-1 px-5 py-4">
              <p className="text-[22px] leading-none font-medium tracking-[-0.02em] text-foreground">11:00 AM</p>
              <p className="mt-2 flex items-center gap-1.5 text-[14px] text-muted-foreground"><CalendarIcon className="size-3.5" /> 45 minutes</p>
              <p className="mt-1 flex items-center gap-1.5 text-[14px] text-muted-foreground"><GlobalIcon className="size-3.5" /> Video call</p>
            </div>
          </Inset>
          <div className="mt-3.5 flex items-center justify-end gap-1.5">
            <button type="button" className={BTN_GHOST} onClick={() => act("reschedule")}>Reschedule</button>
            <button type="button" className={cn(BTN_DARK, "min-w-32")} onClick={() => act("confirm")}>Confirm</button>
          </div>
        </>
      )
    case "message":
      return (
        <>
          <div className="mt-3.5 rounded-[20px] rounded-tl-lg bg-secondary/70 px-4 py-3.5 text-[15.5px] leading-relaxed">
            Loved your portfolio! Could you share your GitHub link before Friday? We’d like to move you forward.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="field-surface flex h-12 min-w-0 flex-1 items-center rounded-full px-5 text-[15px] text-muted-foreground/60">Write a reply…</span>
            <button type="button" aria-label="Send reply" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none transition-transform duration-150 hover:scale-105 active:scale-90" onClick={() => act("reply")}>
              <ArrowRightIcon className="size-[18px]" />
            </button>
          </div>
        </>
      )
    case "shortlisted": {
      const steps = ["Applied", "Review", "Shortlist", "Offer"]
      return (
        <Inset tone="tone-violet">
          <div className="flex items-start">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <span className="flex w-14 flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-[12px] font-semibold",
                      i < 2 && "bg-(--c-violet) text-white",
                      i === 2 && "bg-card text-(--t-fg) shadow-[inset_0_0_0_2px_var(--c-violet)] ring-[5px] ring-(--c-violet)/25",
                      i > 2 && "bg-card/70 text-muted-foreground"
                    )}
                  >
                    {i < 2 ? "✓" : i + 1}
                  </span>
                  <span className={cn("text-[12.5px]", i === 2 ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
                </span>
                {i < 3 && <span className={cn("mt-3.5 h-0.5 flex-1 rounded-full", i < 2 ? "bg-(--c-violet)" : "bg-foreground/12")} />}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3.5 text-[14px] text-muted-foreground">Next: the recruiter will reach out to schedule an interview.</p>
        </Inset>
      )
    }
    case "match":
      return (
        <>
          <Inset tone="tone-peach" className="flex items-center gap-3.5">
            <OrgAvatar name="Razorpay" className="size-11 bg-card" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-medium text-foreground">Data Analyst Intern</p>
              <p className="truncate text-[14px] text-muted-foreground">Razorpay · Remote · ₹22,000/mo</p>
            </div>
            <Ring value={86} />
          </Inset>
          <div className="mt-3.5 flex items-center justify-end gap-1.5">
            <button type="button" className={BTN_GHOST} onClick={() => act("save")}>Save</button>
            <Link href="/internships" className={cn(BTN_DARK, "min-w-32")}>View role</Link>
          </div>
        </>
      )
    case "deadline":
      return (
        <>
          <Inset tone="tone-pink">
            <div className="flex items-end justify-between">
              <p className="text-[2.5rem] leading-none font-light tracking-[-0.05em] text-foreground tabular-nums">2<span className="ml-1.5 text-[16px] tracking-normal text-muted-foreground">days left</span></p>
              <p className="text-[13.5px] text-muted-foreground">Closes 5 Nov</p>
            </div>
            <TickProgress value={7} ticks={32} color="oklch(0.72 0.09 28)" className="mt-4 h-5" />
          </Inset>
          <div className="mt-3.5 flex justify-end">
            <Link href="/internships" className={cn(BTN_DARK, "min-w-32")}>Apply now</Link>
          </div>
        </>
      )
    case "listing":
      return (
        <>
          <Inset tone="tone-amber">
            <div className="flex items-end justify-between">
              <p className="text-[2.5rem] leading-none font-light tracking-[-0.05em] text-foreground tabular-nums">3<span className="ml-1.5 text-[16px] tracking-normal text-muted-foreground">days left</span></p>
              <p className="text-[13.5px] text-muted-foreground">14 applicants so far</p>
            </div>
            <TickProgress value={10} ticks={32} color="oklch(0.72 0.09 28)" className="mt-4 h-5" />
          </Inset>
          <div className="mt-3.5 flex items-center justify-end gap-1.5">
            <button type="button" className={BTN_GHOST} onClick={() => act("expire")}>Let it expire</button>
            <button type="button" className={cn(BTN_DARK, "min-w-32")} onClick={() => act("extend")}>Extend 14 days</button>
          </div>
        </>
      )
    case "tip": {
      const rows = [
        ["Basic details", true],
        ["Education", true],
        ["Skills — add 2 more", false],
      ] as const
      return (
        <>
          <Inset tone="tone-mint">
            <ul className="space-y-2.5">
              {rows.map(([label, ok]) => (
                <li key={label} className="flex items-center gap-3 text-[15px]">
                  <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", ok ? "bg-(--c-mint) text-[oklch(0.25_0.06_170)]" : "border border-dashed border-foreground/30 text-transparent")}>✓</span>
                  <span className={ok ? "text-foreground" : "font-medium text-foreground"}>{label}</span>
                </li>
              ))}
            </ul>
          </Inset>
          <div className="mt-3.5 flex justify-end">
            <Link href="/dashboard/student/skills" className={cn(BTN_DARK, "min-w-32")}>Add skills</Link>
          </div>
        </>
      )
    }
    case "closed":
      return (
        <Inset tone="tone-pink" className="flex items-start gap-3">
          <CloseCircleIcon className="mt-0.5 size-5 shrink-0 text-(--t-fg)" />
          <div>
            <p className="text-[15.5px] font-medium text-foreground">Position filled</p>
            <p className="mt-0.5 text-[14.5px] leading-snug text-muted-foreground">Your profile stays visible for similar roles — keep going.</p>
          </div>
        </Inset>
      )
    case "applicant":
      return (
        <>
          <Inset tone="tone-blue">
            <div className="flex items-center gap-2.5 rounded-2xl bg-card/80 px-3.5 py-2.5">
              <ApplicationsIcon className="size-[18px] text-(--t-fg)" />
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">Liam-Kapoor-Resume.pdf</span>
              <span className="text-[13px] text-muted-foreground">212 KB</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between text-[14px]">
              <span className="text-muted-foreground">Skill match</span>
              <span className="font-medium text-foreground tabular-nums">82%</span>
            </div>
            <TickProgress value={82} ticks={32} color="var(--c-sky)" className="mt-2 h-5" />
          </Inset>
          <div className="mt-3.5 flex items-center justify-end gap-1.5">
            <button type="button" className={BTN_GHOST} onClick={() => act("candDecline")}>Decline</button>
            <button type="button" className={cn(BTN_DARK, "min-w-32")} onClick={() => act("shortlist")}>Shortlist</button>
          </div>
        </>
      )
    case "security":
      return (
        <>
          <Inset tone="tone-amber" className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-card text-(--t-fg)"><GlobalIcon className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-[15.5px] font-medium text-foreground">Chrome on Windows</p>
              <p className="text-[14px] text-muted-foreground">Mumbai, India · 10:42 PM</p>
            </div>
          </Inset>
          <div className="mt-3.5 flex items-center justify-end gap-1.5">
            <button type="button" className={BTN_GHOST} onClick={() => act("notMe")}>Not me</button>
            <button type="button" className={cn(BTN_DARK, "min-w-32")} onClick={() => act("itsMe")}>It’s me</button>
          </div>
        </>
      )
    case "system":
      return (
        <Inset tone="tone-mist">
          <p className="text-[14.5px] leading-snug text-muted-foreground">CareerBridge may be unavailable for a few minutes. Your applications are safe.</p>
        </Inset>
      )
  }
}

/* ── Panel ───────────────────────────────────────────────────────────────── */
export function NotificationsMenu({ className }: { className?: string }) {
  const { user } = useAuth()
  const role = user?.role === "company" ? "company" : "student"
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<Tab>("all")
  const [preview, setPreview] = React.useState(false)
  const [read, setRead] = React.useState<Set<string>>(new Set())
  const [done, setDone] = React.useState<Record<string, Outcome>>({})
  const rootRef = React.useRef<HTMLDivElement>(null)

  // Stay mounted while the closing animation plays, then unmount.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const t = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(t)
  }, [open])

  const mine = CATALOGUE.filter((n) => n.role === role || n.role === "both")
  const base = preview ? CATALOGUE : mine.slice(0, 6)
  const shown = base.filter((n) => tab === "all" || n.tab === tab)
  const fresh = shown.filter((n) => n.unread && !read.has(n.id))
  const earlier = shown.filter((n) => !(n.unread && !read.has(n.id)))
  const unreadCount = mine.filter((n) => n.unread && !read.has(n.id)).length

  React.useEffect(() => {
    const openIt = () => setOpen(true)
    window.addEventListener("cb:notifications", openIt)
    return () => window.removeEventListener("cb:notifications", openIt)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const markRead = (id: string) => setRead((r) => new Set(r).add(id))

  const card = (n: Item) => {
    const isUnread = n.unread && !read.has(n.id)
    return (
      <li
        key={n.id}
        onClick={() => markRead(n.id)}
        className="rounded-[26px] border border-(--hairline) bg-card p-4 shadow-[0_1px_2px_oklch(0.2_0.05_280/0.04),0_14px_28px_-20px_oklch(0.2_0.06_280/0.28)]"
      >
        <div className="flex items-start gap-3.5">
          <Avatar item={n} />
          <div className="min-w-0 flex-1">
            <p className="text-[15.5px] leading-snug">
              {n.actor && <b className="font-medium">{n.actor} </b>}
              <span className="text-foreground/70">{n.text}</span>
              {n.target && <b className="font-medium"> {n.target}</b>}
            </p>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              {n.meta}
              {preview && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11.5px] font-medium text-foreground/70">{KIND_LABEL[n.kind]}</span>}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 pt-0.5 text-[13px] text-muted-foreground tabular-nums">
            {isUnread && <span className="size-2 rounded-full bg-(--c-violet)" aria-label="Unread" />}
            {n.time}
          </span>
        </div>
        <Body
          item={n}
          done={done[n.id] ?? null}
          act={(key) => {
            const o = OUT[key]
            setDone((d) => ({ ...d, [n.id]: o }))
            markRead(n.id)
            showOutcomeToast(o)
          }}
          undo={() => setDone((d) => Object.fromEntries(Object.entries(d).filter(([k]) => k !== n.id)))}
        />
      </li>
    )
  }

  const group = (label: string, list: Item[]) =>
    list.length === 0 ? null : (
      <li key={label} className="list-none">
        <p className="mb-2.5 px-2 text-[12.5px] font-medium tracking-[0.1em] text-muted-foreground uppercase">{label}</p>
        <ul className="space-y-3">{list.map(card)}</ul>
      </li>
    )

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="glass-nav relative flex size-11 shrink-0 items-center justify-center rounded-full text-foreground/85 outline-none transition-[transform,color] duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90 [&_svg]:size-[18px]"
      >
        <BellIcon />
        {unreadCount > 0 && <span className="absolute top-2.5 right-3 size-2 rounded-full bg-destructive ring-2 ring-card" />}
      </button>

      {(open || mounted) && (
        <div
          role="dialog"
          aria-label="Notifications"
          data-state={open ? "open" : "closed"}
          inert={!open}
          className="absolute top-full right-0 z-50 mt-3 flex max-h-[min(42rem,calc(100svh-7rem))] w-[min(31rem,calc(100vw-2rem))] origin-top-right flex-col overflow-hidden rounded-[30px] border border-(--hairline) bg-popover text-popover-foreground shadow-[0_36px_72px_-28px_oklch(0.2_0.06_280/0.5),0_2px_6px_oklch(0.2_0.06_280/0.06)] duration-350 ease-(--ease-out) data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards data-[state=closed]:duration-250 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-0 motion-reduce:animate-none"
        >
          {/* double border: an inset bezel line, drawn above the content */}
          <span aria-hidden className="pointer-events-none absolute inset-[5px] z-20 rounded-[24px] border border-(--keyline-card)" />

          <div className="flex shrink-0 items-center justify-between gap-3 px-7 pt-6">
            <h3 className="text-[24px] font-medium tracking-[-0.025em]">Notifications</h3>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              aria-pressed={preview}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-[13.5px] font-medium outline-none transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                preview ? "border-transparent bg-primary text-primary-foreground" : "border-(--hairline) bg-card hover:bg-secondary"
              )}
            >
              {preview ? "Showing every type" : "Preview all types"}
            </button>
          </div>

          <div role="tablist" className="mt-4 flex shrink-0 gap-6 overflow-x-auto border-b border-(--hairline) px-7">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "-mb-px shrink-0 border-b-2 pb-3.5 text-[15px] font-medium outline-none transition-colors duration-150",
                  tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <ul className="flex-1 space-y-6 overflow-y-auto overscroll-contain bg-secondary/55 p-4 pb-5">
            {shown.length === 0 && <li className="px-4 py-14 text-center text-[15px] text-muted-foreground">You’re all caught up.</li>}
            {group("New", fresh)}
            {group("Earlier", earlier)}
          </ul>

          <div className="flex shrink-0 items-center justify-between border-t border-(--hairline) px-7 py-4 text-[14px]">
            <button
              type="button"
              className="font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
              onClick={() => setRead(new Set(CATALOGUE.map((n) => n.id)))}
            >
              Mark all as read
            </button>
            <span className="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "No unread"}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Open the notifications panel from anywhere (e.g. the sidebar row). */
export function openNotifications() {
  window.dispatchEvent(new Event("cb:notifications"))
}
