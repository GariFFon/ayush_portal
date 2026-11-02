"use client"

/**
 * Dashboard widgets borrowed from real job portals (recommended roles, closing
 * soon, saved jobs, activity, upcoming interviews) plus two that are ours:
 * skill-gap view and match scores.
 */

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { demoSkills, type InternshipRow } from "@/lib/demo"
import { MODE_LABEL, getSampleDetail, makeSampleDetails, type BrowseInternship } from "@/lib/internship-data"
import { useSavedJobs } from "@/lib/use-jobs"
import { BookmarkIcon, BookmarkSolidIcon, CalendarIcon } from "@/components/icons"
import { OrgAvatar, Panel, STATUS_DOT, TickProgress, stagger } from "@/components/kit"
import { daysUntil } from "@/components/internship-card"
import { Button } from "@/components/ui/button"

const rupees = (v: string | number) => `₹${Number(v || 0).toLocaleString("en-IN")}`

/** Weighted skill match for sample data (required skills count 3×, like the backend). */
export function sampleMatch(jobId: number): number {
  const mine = new Set(demoSkills.map((s) => s.skill.name))
  const skills = getSampleDetail(jobId).internship_skills
  const req = skills.filter((s) => s.is_required)
  const pref = skills.filter((s) => !s.is_required)
  const max = req.length * 3 + pref.length
  if (!max) return 100
  const earned = req.filter((s) => mine.has(s.skill.name)).length * 3 + pref.filter((s) => mine.has(s.skill.name)).length
  return Math.round((earned / max) * 100)
}

export function timeAgo(iso: string, now: number) {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function BookmarkButton({ id }: { id: number }) {
  const { has, toggle } = useSavedJobs()
  const saved = has(id)
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save job"}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,color,transform] duration-150 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:scale-90",
        saved ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {saved ? <BookmarkSolidIcon className="size-[18px]" /> : <BookmarkIcon className="size-[18px]" />}
    </button>
  )
}

/* ── Recommended for you ─────────────────────────────────────────────── */
export function RecommendedJobs({ jobs, isDemo, className }: { jobs: BrowseInternship[]; isDemo: boolean; className?: string }) {
  const rows = jobs
    .map((j) => ({ ...j, match: isDemo ? sampleMatch(j.id) : undefined }))
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0))
    .slice(0, 4)

  return (
    <Panel
      className={className}
      title="Recommended for you"
      style={stagger(6)}
      action={<Link href="/internships" className="text-[14px] font-medium underline-offset-4 hover:underline">See all</Link>}
      contentClassName="-mx-3"
    >
      {rows.length === 0 ? (
        <p className="px-3 py-10 text-center text-sm text-muted-foreground">New internships will appear here.</p>
      ) : (
        <ul className="stagger">
          {rows.map((j) => (
            <li key={j.id} className="flex items-center gap-4 rounded-[20px] px-3 py-3 transition-colors duration-150 hover:bg-secondary/70">
              <OrgAvatar name={j.company_name} className="size-11" />
              <Link href={`/internships/${j.id}`} className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{j.title}</p>
                <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                  {j.company_name} · {j.location || "Remote"} · {MODE_LABEL[j.work_mode] ?? j.work_mode}
                </p>
              </Link>
              <p className="hidden text-right sm:block">
                <span className="text-[14px] font-medium tabular-nums">{rupees(j.stipend)}</span>
                <span className="block text-[11.5px] text-muted-foreground">per month</span>
              </p>
              {j.match !== undefined && (
                <p className="w-12 text-right">
                  <span className="text-[15px] font-medium tabular-nums">{j.match}%</span>
                  <span className="block text-[11.5px] text-muted-foreground">match</span>
                </p>
              )}
              <BookmarkButton id={j.id} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* ── Closing soon ────────────────────────────────────────────────────── */
export function ClosingSoon({ jobs, now, className }: { jobs: BrowseInternship[]; now: number; className?: string }) {
  const rows = jobs
    .map((j) => ({ ...j, days: daysUntil(j.deadline, now) }))
    .filter((j) => j.days > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4)

  return (
    <Panel className={className} title="Closing soon" style={stagger(7)} contentClassName="-mx-3">
      {rows.length === 0 ? (
        <p className="px-3 py-10 text-center text-sm text-muted-foreground">Nothing is closing soon.</p>
      ) : (
        <ul className="stagger">
          {rows.map((j) => (
            <li key={j.id}>
              <Link href={`/internships/${j.id}`} className="flex items-center gap-4 rounded-[20px] px-3 py-3 transition-colors duration-150 hover:bg-secondary/70">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{j.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{j.company_name}</p>
                </div>
                <div className="w-24 shrink-0">
                  <TickProgress className="h-5" value={Math.min(100, (j.days / 30) * 100)} color={j.days <= 7 ? "var(--c-red)" : "var(--foreground)"} ticks={14} />
                  <p className={cn("mt-1.5 text-right text-[12px] tabular-nums", j.days <= 7 ? "font-medium text-[var(--c-red)]" : "text-muted-foreground")}>
                    {j.days} day{j.days === 1 ? "" : "s"} left
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* ── Saved jobs ──────────────────────────────────────────────────────── */
export function SavedJobs({ jobs, className }: { jobs: BrowseInternship[]; className?: string }) {
  const { ids } = useSavedJobs()
  const saved = jobs.filter((j) => ids.includes(j.id))
  return (
    <Panel className={className} title="Saved jobs" style={stagger(9)} contentClassName="-mx-3">
      {saved.length === 0 ? (
        <p className="px-3 py-8 text-center text-[14px] leading-relaxed text-muted-foreground">
          Tap the bookmark on any role to keep it here.
        </p>
      ) : (
        <ul className="stagger">
          {saved.map((j) => (
            <li key={j.id} className="flex items-center gap-3 rounded-[20px] px-3 py-2.5 hover:bg-secondary/70">
              <OrgAvatar name={j.company_name} className="size-10" />
              <Link href={`/internships/${j.id}`} className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{j.title}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">{j.company_name}</p>
              </Link>
              <BookmarkButton id={j.id} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* ── Activity timeline ───────────────────────────────────────────────── */
export interface ActivityItem {
  id: number
  text: React.ReactNode
  status: string
  at: string
}

export function ActivityFeed({ items, now, title = "Activity", className }: { items: ActivityItem[]; now: number; title?: string; className?: string }) {
  return (
    <Panel className={className} title={title} style={stagger(8)}>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Activity will show up here.</p>
      ) : (
        <ol className="stagger relative space-y-5">
          <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-border" />
          {items.map((a) => (
            <li key={a.id} className="relative flex gap-4">
              <span className={cn("relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-card", STATUS_DOT[a.status] ?? "bg-muted-foreground")} />
              <div className="min-w-0">
                <p className="text-[14px] leading-snug">{a.text}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{timeAgo(a.at, now)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

/* ── Skills in demand vs yours (sample data) ─────────────────────────── */
export function SkillGap({ className }: { className?: string }) {
  const mine = new Set(demoSkills.map((s) => s.skill.name))
  const counts = new Map<string, number>()
  makeSampleDetails().forEach((d) =>
    d.internship_skills.filter((s) => s.is_required).forEach((s) => counts.set(s.skill.name, (counts.get(s.skill.name) ?? 0) + 1))
  )
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = Math.max(1, ...rows.map((r) => r[1]))
  const covered = rows.filter(([n]) => mine.has(n)).length

  return (
    <Panel className={className} title="Skills in demand" style={stagger(10)} contentClassName="space-y-4">
      <ul className="stagger space-y-3.5">
        {rows.map(([name, n]) => {
          const has = mine.has(name)
          return (
            <li key={name}>
              <div className="flex items-center justify-between text-[14px]">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full" style={{ background: has ? "var(--c-mint)" : "var(--c-red)" }} />
                  {name}
                </span>
                <span className="text-[12px] text-muted-foreground tabular-nums">{n} role{n === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
                <div className="grow-x h-full rounded-full bg-foreground/70" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="border-t border-border pt-4 text-[13px] text-muted-foreground">
        You cover <span className="font-medium text-foreground">{covered} of {rows.length}</span> top skills.
      </p>
      <Button variant="outline" className="w-full" render={<Link href="/dashboard/student/skills" />} nativeButton={false}>
        Close the gaps
      </Button>
    </Panel>
  )
}

/* ── Upcoming interviews (sample data) ───────────────────────────────── */
export function Interviews({ now, className }: { now: number; className?: string }) {
  const rows = [
    { in: 2, title: "Frontend Developer Intern", company: "Zoho Corporation", time: "11:00 AM", mode: "Video call" },
    { in: 5, title: "Backend Engineer Intern", company: "Freshworks", time: "3:30 PM", mode: "On-site" },
  ].map((r) => ({ ...r, date: new Date(now + r.in * 86_400_000) }))

  return (
    <Panel className={className} title="Upcoming interviews" style={stagger(11)}>
      <ul className="stagger space-y-3">
        {rows.map((r) => (
          <li key={r.title} className="flex items-center gap-4 rounded-[20px] bg-secondary/60 p-3.5">
            <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-[14px] bg-card leading-none shadow-xs ring-1 ring-(--hairline)">
              <span className="text-[17px] font-medium tabular-nums">{r.date.getDate()}</span>
              <span className="mt-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                {r.date.toLocaleDateString("en-IN", { month: "short" })}
              </span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-medium">{r.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-muted-foreground">
                <CalendarIcon className="size-3.5" /> {r.company} · {r.time} · {r.mode}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/* ── Company: your listings at a glance ──────────────────────────────── */
export function YourListings({ items, now, className }: { items: InternshipRow[]; now: number; className?: string }) {
  const rows = items.slice(0, 5)
  return (
    <Panel
      className={className}
      title="Your listings"
      style={stagger(6)}
      action={<Link href="/dashboard/company/internships" className="text-[14px] font-medium underline-offset-4 hover:underline">Manage</Link>}
      contentClassName="-mx-3"
    >
      {rows.length === 0 ? (
        <p className="px-3 py-10 text-center text-sm text-muted-foreground">Post your first internship to see it here.</p>
      ) : (
        <ul className="stagger">
          {rows.map((i) => {
            const days = daysUntil(i.deadline, now)
            return (
              <li key={i.id}>
                <Link href={`/internships/${i.id}`} className="flex items-center gap-4 rounded-[20px] px-3 py-3 transition-colors duration-150 hover:bg-secondary/70">
                  <OrgAvatar name={i.title} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{i.title}</p>
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground capitalize">
                      {i.status} · {i.openings} opening{i.openings === 1 ? "" : "s"} · {rupees(i.stipend)}/mo
                    </p>
                  </div>
                  <div className="hidden w-24 shrink-0 sm:block">
                    <TickProgress className="h-5" value={i.status === "published" ? Math.max(0, Math.min(100, (days / 30) * 100)) : 0} ticks={14} />
                    <p className="mt-1.5 text-right text-[12px] text-muted-foreground tabular-nums">
                      {i.status !== "published" ? "—" : days > 0 ? `${days} days left` : "Closed"}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
