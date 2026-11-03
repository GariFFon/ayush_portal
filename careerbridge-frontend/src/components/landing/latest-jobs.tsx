"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { MODE_LABEL, type BrowseInternship } from "@/lib/internship-data"
import { useJobs } from "@/lib/use-jobs"
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { OrgAvatar } from "@/components/kit"

const CATS = [
  { id: "all", label: "All roles", test: () => true },
  { id: "dev", label: "Development", test: (t: string) => /develop|engineer|devops|backend|frontend|software/i.test(t) },
  { id: "design", label: "Design", test: (t: string) => /design|ux|ui\b/i.test(t) },
  { id: "data", label: "Data & AI", test: (t: string) => /data|ml\b|machine|research|analyst/i.test(t) },
]

/** A soft tint per card — the only colour, kept pale. */
const TINTS = [
  "oklch(0.95 0.035 300)",
  "oklch(0.95 0.035 230)",
  "oklch(0.95 0.04 175)",
  "oklch(0.96 0.04 80)",
  "oklch(0.95 0.035 345)",
]

const daysLeft = (d: string, now: number) => Math.ceil((new Date(d).getTime() - now) / 86_400_000)
const short = (v: string | number) => {
  const n = Number(v || 0)
  return n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)
}

/** A calm light card that leans a few degrees toward the pointer. */
function JobCard({ j, i, now }: { j: BrowseInternship; i: number; now: number }) {
  const ref = React.useRef<HTMLAnchorElement>(null)
  const tint = TINTS[i % TINTS.length]
  const left = daysLeft(j.deadline, now)

  const move = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== "mouse") return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`)
    el.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`)
  }
  const leave = () => {
    ref.current?.style.setProperty("--rx", "0deg")
    ref.current?.style.setProperty("--ry", "0deg")
  }

  return (
    <li className="shrink-0 snap-start [perspective:1100px]">
      <Link
        ref={ref}
        href={`/internships/${j.id}`}
        onPointerMove={move}
        onPointerLeave={leave}
        className="group/job relative flex h-[31rem] w-[min(21rem,82vw)] lg:w-[max(19.5rem,calc((100vw-2*clamp(1.5rem,4vw,4rem)-4.5rem)/4))] flex-col rounded-[34px] bg-white p-2 text-[oklch(0.22_0.05_280)] transition-transform duration-300 ease-(--ease-out) will-change-transform outline-none [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] focus-visible:ring-2 focus-visible:ring-white"
      >
        <div className="flex flex-1 flex-col rounded-[27px] p-6" style={{ background: tint }}>
          <div className="flex items-center justify-between">
            <span className="font-display text-[1.15rem] tracking-[0.1em] text-[oklch(0.22_0.05_280/0.5)]">{String(i + 1).padStart(2, "0")}</span>
            <span className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium">{MODE_LABEL[j.work_mode] ?? j.work_mode}</span>
          </div>

          <p className="font-display mt-auto text-[6.4rem] leading-[0.85] tracking-[-0.03em] italic">
            <span className="mr-1 align-top text-[2.2rem] not-italic">₹</span>
            {short(j.stipend)}
          </p>
          <p className="mt-3 text-[13.5px] tracking-[0.14em] text-[oklch(0.22_0.05_280/0.6)] uppercase">per month · {j.duration_months} months</p>
        </div>

        <div className="px-4 pt-5 pb-3">
          <h3 className="text-[23px] leading-[1.12] font-medium tracking-[-0.025em]">{j.title}</h3>
          <p className="mt-1 text-[15px] text-[oklch(0.22_0.05_280/0.6)]">{j.location || "Flexible location"}</p>
          <div className="mt-5 flex items-center gap-3">
            <OrgAvatar name={j.company_name} className="size-11" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[16px] font-medium">{j.company_name}</p>
              <p className="text-[13.5px] text-[oklch(0.22_0.05_280/0.55)]">{left > 0 ? `${left} days left` : "Closed"}</p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[oklch(0.22_0.05_280)] text-white transition-transform duration-500 ease-(--ease-out) group-hover/job:-rotate-45">
              <ArrowRightIcon className="size-5" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}

/** Category tabs with a sliding hairline marker, then a swipeable row of listings that runs the full width of the screen. */
export function LatestJobs() {
  const { jobs } = useJobs()
  const [cat, setCat] = React.useState("all")
  const [now] = React.useState(() => Date.now())
  const rail = React.useRef<HTMLUListElement>(null)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const [mark, setMark] = React.useState({ x: 0, w: 0 })

  const counts = CATS.map((c) => ({ ...c, n: jobs.filter((j) => c.test(j.title)).length }))
  const index = Math.max(0, CATS.findIndex((c) => c.id === cat))
  const active = CATS[index]
  const list: BrowseInternship[] = jobs.filter((j) => active.test(j.title))

  React.useLayoutEffect(() => {
    const el = tabRefs.current[index]
    if (el) setMark({ x: el.offsetLeft, w: el.offsetWidth })
  }, [index, jobs.length])

  const nudge = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 460, behavior: "smooth" })
  const gutter = "px-[clamp(1.5rem,4vw,4rem)]"

  return (
    <div className="mt-12">
      <div className={`flex flex-wrap items-center justify-between gap-5 ${gutter}`}>
        <div className="no-scrollbar relative max-w-full overflow-x-auto" role="tablist" aria-label="Categories">
          <ul className="flex gap-2">
            {counts.map((c, i) => (
              <li key={c.id} className="shrink-0">
                <button
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  aria-selected={cat === c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "flex h-12 items-center gap-2.5 px-5 text-[17px] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white",
                    cat === c.id ? "text-white" : "text-white/60 hover:text-white"
                  )}
                >
                  {c.label}
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[13px] text-white/90 tabular-nums">{c.n}</span>
                </button>
              </li>
            ))}
          </ul>
          <span aria-hidden className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[3px] rounded-full bg-white shadow-[0_0_12px_1px_oklch(1_0_0/0.5)] transition-[transform,width] duration-500 ease-(--ease-drawer)"
            style={{ width: mark.w, transform: `translateX(${mark.x}px)` }}
          />
        </div>

        <div className="flex gap-2.5">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous" className="flex size-12 items-center justify-center rounded-full border border-white/45 text-white outline-none transition-[background-color,transform] duration-150 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white active:scale-90">
            <ChevronLeftIcon className="size-5" />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Next" className="flex size-12 items-center justify-center rounded-full border border-white/45 text-white outline-none transition-[background-color,transform] duration-150 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white active:scale-90">
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* full-bleed: cards start at the page gutter and slide off the real screen edges */}
      <ul ref={rail} className={`no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-[clamp(1.5rem,4vw,4rem)] gap-6 overflow-x-auto pb-2 ${gutter}`}>
        {list.map((j, i) => (
          <JobCard key={j.id} j={j} i={i} now={now} />
        ))}
        {list.length === 0 && <li className="py-16 text-[17px] text-white/70">No roles in this category yet.</li>}
      </ul>
    </div>
  )
}
