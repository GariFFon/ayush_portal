import Link from "next/link"
import { cn } from "cn"

import { Roll } from "@/components/landing/roll-link"

/**
 * "Who it's for": a pinned horizontal journey. One thread runs through every scene;
 * each scene is a centred serif title with a quiet caption, an oval call to action,
 * and a handful of floating "windows" that drift at their own speed (data-hpar).
 */

/* ── little pieces ───────────────────────────────────────────────────────── */
function OvalLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="group/oval font-display relative inline-flex h-14 items-center justify-center px-12 text-[1.1rem] tracking-[0.08em] text-[oklch(0.22_0.06_280)] uppercase outline-none">
      <svg aria-hidden viewBox="0 0 320 56" preserveAspectRatio="none" className="absolute inset-0 size-full text-[oklch(0.22_0.06_280/0.55)] transition-[transform,color] duration-500 ease-(--ease-out) group-hover/oval:scale-[1.06] group-hover/oval:text-[oklch(0.22_0.06_280)]" fill="none" stroke="currentColor">
        <ellipse cx="160" cy="28" rx="158" ry="26" />
      </svg>
      <span className="relative">
        <Roll>{children}</Roll>
      </span>
    </Link>
  )
}

type Pos = { left: string; top: string; w: string; h: string; par: string; rot?: string; label?: string }


/** Fine line-art ground for each plate: dots, rules or contour rings, in ink at very low contrast. */
function ground(hue: number) {
  const kind = Math.round(hue / 10) % 3
  const line = "oklch(0.25 0.08 280 / 0.1)"
  if (kind === 0) return `radial-gradient(${line} 1.2px, transparent 1.6px) 0 0 / 14px 14px`
  if (kind === 1) return `repeating-linear-gradient(0deg, ${line} 0 1px, transparent 1px 11px)`
  return `repeating-radial-gradient(circle at 78% 18%, ${line} 0 1px, transparent 1px 12px)`
}

/** An editorial plate: paper, a hairline frame, a second frame offset behind it, and a figure caption. */
function Win({ pos, shape = "rect", hue, children, className }: { pos: Pos; shape?: "rect" | "circle"; hue: number; children?: React.ReactNode; className?: string }) {
  const round = shape === "circle"
  return (
    <div data-hpar={pos.par} className="absolute hidden lg:block" style={{ left: pos.left, top: pos.top, width: pos.w, height: pos.h }}>
      {/* the offset frame behind */}
      <span aria-hidden className={cn("absolute inset-0 translate-x-3 translate-y-3 border border-[oklch(0.2_0.05_280/0.22)]", round ? "rounded-full" : "")} />
      <div
        className={cn("relative size-full overflow-hidden border border-[oklch(0.2_0.05_280/0.85)] bg-[oklch(0.995_0.004_285)] text-[oklch(0.2_0.05_280)]", round ? "rounded-full" : "", className)}
        style={{ transform: pos.rot ? `rotate(${pos.rot})` : undefined }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: ground(hue) }} />
        {/* one soft wash of accent, bottom-right, so each plate has a single quiet colour */}
        <span aria-hidden className="pointer-events-none absolute -right-1/4 -bottom-1/3 size-[75%] rounded-full opacity-60 blur-2xl" style={{ background: `oklch(0.88 0.08 ${hue})` }} />
        <div className="relative size-full">{children}</div>
      </div>
      {pos.label && (
        <span className="absolute -bottom-9 left-0 flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.22em] whitespace-nowrap text-[oklch(0.2_0.05_280/0.55)] uppercase">
          <span aria-hidden className="h-px w-5 bg-[oklch(0.2_0.05_280/0.4)]" />
          {pos.label}
        </span>
      )}
    </div>
  )
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-[oklch(0.2_0.05_280/0.5)] bg-white px-3 py-1 text-[12.5px] font-medium">{children}</span>
)

function Ring({ v, size = 96 }: { v: number; size?: number }) {
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
    </svg>
  )
}

/* ── scene furniture ─────────────────────────────────────────────────────── */
function Arcs() {
  return (
    <svg aria-hidden viewBox="0 0 1000 700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full text-[oklch(0.35_0.12_280)]" fill="none" stroke="currentColor" strokeWidth="1">
      {/* concentric rings centred on the scene, so the whole thing stays symmetrical */}
      <ellipse cx="500" cy="350" rx="470" ry="330" strokeOpacity="0.08" vectorEffect="non-scaling-stroke" />
      <ellipse cx="500" cy="350" rx="340" ry="236" strokeOpacity="0.12" vectorEffect="non-scaling-stroke" />
      <ellipse cx="500" cy="350" rx="210" ry="142" strokeOpacity="0.17" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Center({ caption, title, extra, cta, href }: { caption: string; title: string[]; extra: string; cta: string; href: string }) {
  return (
    <div className="relative z-10 mx-auto flex flex-col items-center px-6 text-center lg:absolute lg:top-1/2 lg:left-[31%] lg:w-[38%] lg:-translate-y-1/2 lg:px-0">
      <p className="max-w-[24rem] text-[15px] leading-snug font-semibold text-[oklch(0.22_0.06_280/0.85)]">{caption}</p>
      <h3 className="font-display mt-4 text-[clamp(3.6rem,7.6vw,7.4rem)] leading-[0.9] tracking-[-0.015em] whitespace-nowrap uppercase italic">
        {title.map((t) => (
          <span key={t} className="block">
            {t}
          </span>
        ))}
      </h3>
      <div className="mt-9">
        <OvalLink href={href}>{cta}</OvalLink>
      </div>
      <p className="mt-9 max-w-[22rem] text-[14.5px] leading-snug font-semibold text-[oklch(0.22_0.06_280/0.6)]">{extra}</p>
    </div>
  )
}

/* ── the section ─────────────────────────────────────────────────────────── */
export function RolesScroll() {
  return (
    <section id="roles" data-hscroll className="relative bg-[oklch(0.987_0.005_285)] text-[oklch(0.2_0.05_280)]">
      <div className="h-stick relative overflow-hidden py-24 lg:sticky lg:top-0 lg:h-svh lg:py-0">
        <div className="h-track relative flex flex-col gap-24 lg:h-full lg:w-max lg:flex-row lg:gap-0">
          {/* the thread: one hairline through every scene */}
          <span aria-hidden className="pointer-events-none absolute top-1/2 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-[oklch(0.2_0.05_280/0.4)] to-transparent lg:block" />

          {/* ── intro ── */}
          <div className="h-panel relative lg:h-full lg:w-[78vw]">
            <Arcs />
            <div className="relative z-10 flex flex-col items-center px-6 text-center lg:absolute lg:top-1/2 lg:left-[8%] lg:w-[84%] lg:-translate-y-1/2 lg:px-0">
              <p className="text-[13px] font-semibold tracking-[0.22em] text-[oklch(0.22_0.06_280/0.55)] uppercase">Who it&rsquo;s for</p>
              <h2 data-mask className="font-display mt-5 text-[clamp(3.4rem,7.6vw,7.4rem)] leading-[0.92] tracking-[-0.01em] uppercase italic">
                <span className="mask-line pr-[0.12em]"><span>One portal,</span></span>
                <span className="mask-line pr-[0.12em]"><span>three sides</span></span>
              </h2>
              <p className="mt-9 hidden items-center gap-3 text-[14px] font-semibold tracking-[0.18em] text-[oklch(0.22_0.06_280/0.55)] uppercase lg:flex">
                Scroll
                <svg aria-hidden viewBox="0 0 48 12" className="w-12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 6h45M41 1l5 5-5 5" />
                </svg>
              </p>
            </div>
            <Win pos={{ left: "70%", top: "58%", w: "13rem", h: "13rem", par: "0.5", label: "Fig. 00 · Overview" }} shape="circle" hue={285}>
              <div className="absolute inset-0 flex items-center justify-center font-display text-[4.6rem] italic">3</div>
            </Win>
          </div>

          {/* ── students ── */}
          <div data-seg className="h-panel relative lg:h-full lg:w-[128vw]">
            <Arcs />
            <Win pos={{ left: "3%", top: "20%", w: "27%", h: "36%", par: "0.45", label: "Fig. 01 · Skill map" }} hue={262}>
              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex flex-wrap gap-2">
                  {["Python", "React", "SQL", "Figma", "Git"].map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
                <p className="font-display text-[2.6rem] leading-none italic">Your skills, mapped</p>
              </div>
            </Win>
            <Win pos={{ left: "40%", top: "-3%", w: "22%", h: "30%", par: "-0.35", label: "Fig. 02 · Match score" }} hue={300}>
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <div className="relative flex items-center justify-center text-[oklch(0.45_0.17_285)]">
                  <Ring v={86} size={124} />
                  <span className="font-display absolute text-[2.6rem] italic">86%</span>
                </div>
                <p className="text-[12.5px] tracking-[0.18em] text-[oklch(0.22_0.06_280/0.6)] uppercase">Match score</p>
              </div>
            </Win>
            <Win pos={{ left: "70%", top: "56%", w: "24%", h: "28%", par: "0.7", label: "Fig. 03 · Status" }} hue={240}>
              <ul className="flex h-full flex-col justify-center gap-2.5 p-6 text-[13.5px]">
                {[["Zoho", "Shortlisted"], ["Razorpay", "In review"], ["Freshworks", "Offer"]].map(([a, b]) => (
                  <li key={a} className="flex items-center justify-between border-b border-[oklch(0.3_0.1_280/0.1)] pb-2">
                    <span className="font-semibold">{a}</span>
                    <span className="text-[oklch(0.22_0.06_280/0.55)]">{b}</span>
                  </li>
                ))}
              </ul>
            </Win>
            <Center
              caption="Build a skill profile, find the right internship, follow every application."
              title={["Students"]}
              extra="Your resume is read for you, every listing shows a match score, and each application keeps a live status."
              cta="Join as a student"
              href="/register?role=student"
            />
          </div>

          {/* ── companies ── */}
          <div data-seg className="h-panel relative lg:h-full lg:w-[128vw]">
            <Arcs />
            <Win pos={{ left: "66%", top: "54%", w: "28%", h: "32%", par: "0.5", label: "Fig. 04 · Pipeline" }} hue={300}>
              <div className="flex h-full flex-col justify-center gap-3 p-6">
                {[["Applied", 92], ["In review", 58], ["Shortlisted", 36], ["Selected", 14]].map(([l, n]) => (
                  <div key={l as string} className="flex items-center gap-3 text-[12.5px]">
                    <span className="w-20 text-[oklch(0.22_0.06_280/0.6)]">{l}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-[oklch(0.3_0.1_280/0.1)]">
                      <span className="block h-full rounded-full bg-[oklch(0.5_0.17_283)]" style={{ width: `${n}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </Win>
            <Win pos={{ left: "6%", top: "52%", w: "20%", h: "32%", par: "-0.4", label: "Fig. 05 · Shortlist" }} hue={320}>
              <ul className="flex h-full flex-col justify-center gap-3 p-6 text-[13.5px]">
                {["Aarav S.", "Priya N.", "Liam K."].map((n, i) => (
                  <li key={n} className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-white text-[11px] font-semibold shadow-sm">{n.slice(0, 2)}</span>
                    <span className="flex-1 font-semibold">{n}</span>
                    <span className="text-[oklch(0.22_0.06_280/0.55)]">{[92, 84, 79][i]}%</span>
                  </li>
                ))}
              </ul>
            </Win>
            <Win pos={{ left: "36%", top: "-4%", w: "26%", h: "30%", par: "0.3", label: "Fig. 06 · Volume" }} hue={280}>
              <div className="flex h-full items-end p-6">
                <p className="font-display text-[3.2rem] leading-none italic">38 applicants</p>
              </div>
            </Win>
            <Center
              caption="Post openings, review candidates and move people through your pipeline."
              title={["Companies"]}
              extra="Post in minutes, see candidates ranked by skill fit, and read your hiring pipeline at a glance."
              cta="Join as a recruiter"
              href="/register?role=company"
            />
          </div>

          {/* ── universities ── */}
          <div data-seg className="h-panel relative lg:h-full lg:w-[128vw]">
            <Arcs />
            <Win pos={{ left: "5%", top: "10%", w: "21%", h: "44%", par: "0.4", label: "Fig. 07 · Outcomes" }} hue={190}>
              <div className="flex h-full flex-col justify-end p-6">
                <p className="font-display text-[5.4rem] leading-[0.85] italic">92%</p>
                <p className="mt-2 text-[12.5px] tracking-[0.18em] text-[oklch(0.22_0.06_280/0.6)] uppercase">Placed</p>
              </div>
            </Win>
            <Win pos={{ left: "70%", top: "4%", w: "24%", h: "34%", par: "-0.5", label: "Fig. 08 · Skills" }} hue={175}>
              <div className="flex h-full items-end gap-2 p-6">
                {[40, 68, 52, 88, 74, 96].map((h, i) => (
                  <span key={i} className="flex-1 bg-[oklch(0.5_0.17_283)]" style={{ height: `${h * 0.6}%` }} />
                ))}
              </div>
            </Win>
            <Win pos={{ left: "56%", top: "60%", w: "13rem", h: "13rem", par: "0.75", label: "Fig. 09 · Reach" }} shape="circle" hue={200}>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[3.6rem] leading-none italic">476</span>
                <span className="mt-1 text-[11px] tracking-[0.18em] text-[oklch(0.22_0.06_280/0.6)] uppercase">Universities</span>
              </div>
            </Win>
            <Center
              caption="See how your students are doing — skills, applications, placements."
              title={["Universities"]}
              extra="Placement outcomes by batch, skill distribution across students, and reports you can export."
              cta="Join as a university"
              href="/register?role=university"
            />
          </div>

          {/* ── outro ── */}
          <div className="h-panel relative lg:h-full lg:w-[80vw]">
            <Arcs />
            <div className="relative z-10 flex flex-col items-center px-6 text-center lg:absolute lg:top-1/2 lg:left-[8%] lg:w-[84%] lg:-translate-y-1/2 lg:px-0">
              <h3 className="font-display text-[clamp(3.4rem,7vw,6.8rem)] leading-[0.92] tracking-[-0.01em] uppercase italic">
                <span className="block">Pick yours</span>
                <span className="block">start today</span>
              </h3>
              <div className="mt-9">
                <OvalLink href="/register">Create free account</OvalLink>
              </div>
            </div>
          </div>
        </div>

        {/* progress: three labelled segments, each fills as its scene passes */}
        <div aria-hidden className="absolute right-[clamp(1.5rem,6vw,6rem)] bottom-8 left-[clamp(1.5rem,6vw,6rem)] hidden gap-6 lg:flex">
          {["Students", "Companies", "Universities"].map((l, i) => (
            <div key={l} className="flex-1">
              <p className="mb-2.5 text-[12px] font-semibold tracking-[0.2em] text-[oklch(0.22_0.06_280/0.55)] uppercase">
                0{i + 1} <span className="ml-2">{l}</span>
              </p>
              <span className="relative block h-px bg-[oklch(0.3_0.1_280/0.18)]">
                <span className="h-seg absolute inset-y-0 left-0 h-[2px] w-full origin-left -translate-y-px scale-x-0 bg-[oklch(0.4_0.16_280)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
