import Link from "next/link"
import { cn } from "cn"

import { BrandMark } from "@/components/brand-mark"
import { LandingMotion } from "@/components/landing/landing-motion"
import { LatestJobs } from "@/components/landing/latest-jobs"
import { Roll, RollLink } from "@/components/landing/roll-link"
import { RolesScroll } from "@/components/landing/roles-scroll"
import { StickyNav } from "@/components/landing/sticky-nav"
import { WarpGrid } from "@/components/landing/warp-grid"

const COMPANIES = [
  { name: "Zoho", logo: "zoho" },
  { name: "Razorpay", logo: "razorpay" },
  { name: "Postman", logo: "postman" },
  { name: "Swiggy", logo: "swiggy" },
  { name: "Infosys", logo: "infosys" },
  { name: "Paytm", logo: "paytm" },
  { name: "Atlassian", logo: "atlassian" },
  { name: "Zomato", logo: "zomato" },
  { name: "TCS", logo: "tcs" },
  { name: "Figma", logo: "figma" },
  { name: "Wipro", logo: "wipro" },
  { name: "Notion", logo: "notion" },
  { name: "Stripe", logo: "stripe" },
  { name: "Google", logo: "google" },
]

const STATEMENT: { w: string; em?: boolean }[] = (
  "CareerBridge is where *students,* *universities* and *companies* finally meet. Skills are matched in the open, every application is tracked to its last step, and placements are *measured,* not guessed."
)
  .split(" ")
  .map((w) => (w.startsWith("*") ? { w: w.replace(/\*/g, ""), em: true } : { w }))

const FEATURES = [
  { title: "Explainable matching", text: "A transparent score between your skills and what each internship needs — with the gaps spelled out." },
  { title: "Resume that reads itself", text: "Upload a PDF and we pull out the skills we recognise. You decide what to add." },
  { title: "Placement analytics", text: "Dashboards for every role: trends, skill distribution and outcomes." },
  { title: "Role-based workspaces", text: "Students, recruiters and universities each get their own calm dashboard." },
  { title: "Verified companies", text: "Recruiters are verified before they post, so every opportunity is worth your time." },
  { title: "Credentials that count", text: "Certificates, experience and achievements on one profile, with the proof attached." },
]

const STATS = [
  { n: 3, suffix: "", label: "role-based dashboards" },
  { n: 100, suffix: "%", label: "explainable matching" },
  { n: 90, suffix: "+", label: "skills recognised in a resume" },
  { n: 476, suffix: "", label: "universities ready to pick" },
]

export default function HomePage() {
  return (
    <div className="min-h-svh overflow-x-clip bg-background">
      <LandingMotion />
      <StickyNav />

      {/* ───────────────────────── Hero: one dark-to-glow gradient, hairline arcs, a centred line ───────────────────────── */}
      <section className="relative isolate flex min-h-svh flex-col items-center overflow-hidden bg-[linear-gradient(180deg,oklch(0.1_0.02_280)_0%,oklch(0.16_0.06_280)_38%,oklch(0.34_0.14_283)_72%,oklch(0.56_0.15_290)_100%)] text-white [border-radius:0_0_50%_50%/0_0_3.5rem_3.5rem]">
        {/* hairline arcs */}
        <svg aria-hidden data-parallax="0.08" className="pointer-events-none absolute inset-0 -z-10 size-full text-white" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1">
          <ellipse cx="800" cy="60" rx="1100" ry="150" />
          <ellipse cx="800" cy="470" rx="470" ry="640" />
          <ellipse cx="800" cy="470" rx="900" ry="440" />
          <path d="M0 150C300 520 520 760 800 900M1600 150C1300 520 1080 760 800 900" />
          <path d="M0 450h1600" strokeOpacity="0.08" />
        </svg>

        {/* the glow: a soft ring of light behind the words */}
        <div aria-hidden data-parallax="0.15" className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-[46%]">
          <div data-intro="tile" className="relative size-[min(78vw,34rem)]">
            <div className="halo-turn absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.7_0.17_300),oklch(0.78_0.12_20),oklch(0.85_0.1_75),oklch(0.62_0.18_270),oklch(0.7_0.17_300))] opacity-80 blur-[34px] [mask-image:radial-gradient(closest-side,transparent_52%,#000_74%,transparent_100%)]" />
            <div className="absolute inset-[18%] rounded-full bg-[oklch(0.45_0.18_285/0.18)] blur-3xl" />
          </div>
        </div>

        {/* top bar: logo in the middle, three quiet links */}
        <div className="relative z-10 mt-9 flex flex-col items-center">
          <Link href="/" aria-label="CareerBridge home" data-intro="fade" className="rounded-3xl transition-transform duration-300 hover:scale-105">
            <BrandMark className="size-16" />
          </Link>
          <nav aria-label="Primary" className="font-display mt-6 grid w-[min(92vw,76rem)] grid-cols-3 items-center text-[clamp(1.05rem,1.6vw,1.4rem)]">
            <Link href="/login" data-intro="fade" className="justify-self-start italic text-white/85 transition-colors hover:text-white">
              <Roll>Sign in</Roll>
            </Link>
            <a href="#internships" data-intro="fade" className="justify-self-center text-white/85 transition-colors hover:text-white">
              <Roll>Internships</Roll>
            </a>
            <Link href="/register" data-intro="fade" className="justify-self-end text-white/85 transition-colors hover:text-white">
              <Roll>Sign up</Roll>
            </Link>
          </nav>
        </div>

        {/* centre: the line */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-4 pb-24 text-center">
          <h1 className="font-display text-[clamp(3.6rem,10.5vw,9.5rem)] leading-[0.92] tracking-[-0.02em] uppercase italic">
            <span data-intro="line" className="mask-line pr-[0.18em] -mr-[0.18em]">
              <span>Find your</span>
            </span>
            <span data-intro="line" className="mask-line pr-[0.18em] -mr-[0.18em]">
              <span>first step</span>
            </span>
          </h1>
          <p data-intro="fade" className="font-display mt-9 max-w-2xl text-[clamp(0.95rem,1.35vw,1.2rem)] tracking-[0.04em] uppercase text-white/85">
            The internship &amp; placement portal for students, universities and companies.
          </p>
          <Link
            href="/internships"
            data-intro="fade"
            className="group/cta font-display relative mt-10 inline-flex h-14 items-center justify-center px-12 text-[1.15rem] tracking-[0.06em] uppercase outline-none"
          >
            <svg aria-hidden viewBox="0 0 320 56" preserveAspectRatio="none" className="absolute inset-0 size-full transition-transform duration-500 ease-(--ease-out) group-hover/cta:scale-[1.06]" fill="none" stroke="currentColor" strokeOpacity="0.7">
              <ellipse cx="160" cy="28" rx="158" ry="26" />
            </svg>
            <span className="relative">
              <Roll>Browse internships</Roll>
            </span>
          </Link>
        </div>

        {/* bottom: a small caption, and the way down */}
        <p className="font-display absolute bottom-16 left-10 hidden text-[0.8rem] tracking-[0.12em] uppercase text-white/60 sm:block">Students · Universities · Companies</p>
        <a href="#internships" aria-label="Scroll down" className="group/scroll absolute bottom-7 left-1/2 z-10 flex size-12 -translate-x-1/2 items-center justify-center rounded-full border border-white/40 transition-[background-color,transform] duration-300 hover:scale-110 hover:bg-white/10">
          <svg viewBox="0 0 24 24" className="size-5 transition-transform duration-300 group-hover/scroll:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* ───────────────────────── Marquee: real logos ───────────────────────── */}
      <section aria-label="Teams students apply to" className="marquee overflow-hidden pt-16 pb-6">
        <p className="mb-9 text-center text-[13px] font-medium tracking-[0.2em] text-muted-foreground uppercase">Teams students apply to</p>
        <div className="marquee-track flex items-center gap-24 whitespace-nowrap">
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <span key={i} className="group/co flex cursor-default items-center gap-4 opacity-60 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/logos/${c.logo}.svg`} alt="" width={44} height={44} className="h-11 w-11 object-contain transition-transform duration-300 group-hover/co:scale-110" draggable={false} />
              <span className="text-[1.9rem] font-medium tracking-[-0.03em]">{c.name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Statement ───────────────────────── */}
      <section data-curtain data-read-scope className="relative z-0 h-[280svh]">
      <div className="sticky top-0 isolate flex h-svh items-center overflow-hidden bg-background">
        <div aria-hidden className="absolute inset-0 -z-10 text-[oklch(0.4_0.14_280)]">
          <WarpGrid />
        </div>
        <div className="curtain-inner mx-auto w-full max-w-[1180px] px-6 sm:px-10">
          <p className="mb-10 flex items-center gap-4 text-[13px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            <span aria-hidden className="h-px w-10 bg-foreground/30" />
            What we do
          </p>
          <p data-read className="font-display text-[clamp(2.4rem,5.6vw,5rem)] leading-[1.06] tracking-[-0.02em]">
            {STATEMENT.map(({ w, em }, i) => (
              <span key={i}>
                <span className={cn("read-word", em && "italic text-[oklch(0.42_0.16_278)]")}>{w}</span>{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
      </section>

      {/* ───────────────────────── Latest: its own dark band, rail runs edge to edge ───────────────────────── */}
      <section id="internships" className="relative isolate z-10 -mt-[100svh] flex min-h-svh flex-col justify-center overflow-hidden bg-[linear-gradient(180deg,oklch(0.5_0.17_281),oklch(0.58_0.16_287)_55%,oklch(0.68_0.14_293))] py-24 text-white shadow-[0_-24px_50px_-28px_oklch(0.2_0.1_280/0.4)]">

        <div className="flex flex-wrap items-end justify-between gap-6 px-[clamp(1.5rem,4vw,4rem)]">
          <h2 data-mask className="min-w-[18rem] flex-1 text-[clamp(2.2rem,4.6vw,4.2rem)] leading-[1.05] font-medium tracking-[-0.04em] lg:whitespace-nowrap">
            <span className="mask-line -mx-12 -mt-8 px-12 pt-8 pb-3">
              <span>
                <span className="relative mr-3 inline-block px-1">
                  <svg aria-hidden viewBox="0 0 320 110" className="pointer-events-none absolute -top-5 -left-7 h-[calc(100%+2.2rem)] w-[calc(100%+3.4rem)] text-white/80" fill="none" preserveAspectRatio="none">
                    <path data-draw d="M22 58C26 22 112 6 192 10c82 4 124 20 114 54-10 32-98 44-188 38C56 98 8 84 14 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-display relative text-[oklch(0.86_0.1_300)] italic">Latest</span>
                </span>
                Internship opportunities
              </span>
            </span>
          </h2>
          <RollLink href="/internships" variant="light">
            Browse all internships
          </RollLink>
        </div>

        <LatestJobs />
      </section>

      <div className="relative z-10 bg-background">
      {/* ───────────────────────── Roles: horizontal journey ───────────────────────── */}
      <RolesScroll />

      {/* ───────────────────────── Numbers ───────────────────────── */}
      <section className="mx-auto max-w-[1280px] px-6 pb-24 sm:px-10">
        <ul className="grid gap-y-10 border-y border-border py-14 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <li key={s.label} className="lg:border-l lg:border-border lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <p className="text-[clamp(3rem,6vw,5rem)] leading-none font-light tracking-[-0.06em] tabular-nums">
                <span data-count={s.n} data-suffix={s.suffix}>
                  0
                </span>
              </p>
              <p className="mt-3 text-[16px] text-muted-foreground">{s.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────────────── Why ───────────────────────── */}
      <section id="why" className="mx-auto max-w-[1280px] px-6 pb-28 sm:px-10">
        <h2 data-mask className="max-w-3xl text-[clamp(2.2rem,4.8vw,4rem)] leading-[1.05] font-medium tracking-[-0.04em]">
          <span className="mask-line"><span>Everything in the open,</span></span>
          <span className="mask-line"><span>nothing left to guess.</span></span>
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <article key={f.title} data-parallax={i % 3 === 1 ? "0.06" : "0.02"} className="rounded-[32px] border border-(--hairline) bg-card p-8 shadow-[0_24px_44px_-34px_oklch(0.2_0.06_280/0.3)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5">
              <span className="text-[15px] font-medium text-[oklch(0.5_0.15_280)] tabular-nums">0{i + 1}</span>
              <h3 className="mt-6 text-[24px] leading-tight font-medium tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-3 text-[16.5px] leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section id="start">
        <div className="relative overflow-hidden bg-[linear-gradient(150deg,oklch(0.4_0.16_274),oklch(0.5_0.16_281)_70%)] px-8 py-28 text-center text-white sm:px-14">
          <span aria-hidden data-parallax="0.3" className="pointer-events-none absolute -top-24 left-[8%] size-[22rem] rounded-full bg-[oklch(0.75_0.13_290/0.35)] blur-3xl" />
          <span aria-hidden data-parallax="0.15" className="pointer-events-none absolute -right-16 -bottom-28 size-[26rem] rounded-full bg-[oklch(0.8_0.1_300/0.3)] blur-3xl" />
          <h2 data-mask className="relative text-[clamp(2.8rem,8vw,7rem)] leading-[1] font-medium tracking-[-0.05em]">
            <span className="mask-line"><span>Ready to bridge</span></span>
            <span className="mask-line"><span>the gap?</span></span>
          </h2>
          <p className="relative mx-auto mt-8 max-w-xl text-[19px] leading-relaxed text-white/75">Create your account and see your first dashboard in under a minute.</p>
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
            <RollLink href="/register" variant="light">
              Create free account
            </RollLink>
            <RollLink href="/internships" variant="ghost" className="text-white">
              View internships
            </RollLink>
          </div>
        </div>
      </section>

      </div>

      <footer className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-10 text-[14px] text-muted-foreground sm:flex-row sm:px-10">
        <p>
          <span className="font-semibold text-foreground">CareerBridge</span> · SIH26044 · Ministry of Ayush
        </p>
        <p>© 2026 CareerBridge. Built with Django &amp; Next.js.</p>
      </footer>
    </div>
  )
}
