import Link from "next/link";

import { cn } from "cn";
import { SegBars, StatTile, TaskList } from "@/components/kit";
import { Button } from "@/components/ui/button";

const roles = [
  {
    role: "Students",
    tone: "tone-blue",
    blurb: "Build a skill profile, find the right internship and follow every application.",
    points: ["Skill profile and proficiency", "Browse and apply in one click", "Live application status", "Match score per internship"],
    href: "/register?role=student",
    cta: "Join as a student",
  },
  {
    role: "Companies",
    tone: "tone-violet",
    blurb: "Post openings, review candidates and move people through your pipeline.",
    points: ["Post and publish listings", "Browse candidate profiles", "Shortlist, select, reject", "Hiring pipeline analytics"],
    href: "/register?role=company",
    cta: "Join as a recruiter",
  },
  {
    role: "Universities",
    tone: "tone-mint",
    blurb: "See how students are doing — skills, applications and placements at a glance.",
    points: ["Placement outcomes", "Skill distribution", "Industry readiness", "Exportable reports"],
    href: "/register?role=university",
    cta: "Join as a university",
  },
];

const features = [
  { title: "Smart skill matching", text: "A transparent, rule-based match between your skills and what each internship needs — with the gaps spelled out." },
  { title: "Placement analytics", text: "Dashboards for every role: application trends, skill distribution and placement outcomes." },
  { title: "Role-based workspaces", text: "Students, recruiters and universities each get their own dashboard and permissions." },
  { title: "One-click applications", text: "Apply fast and follow every status change from a single, calm dashboard." },
  { title: "Verified companies", text: "Companies are verified before they post, so every opportunity is worth your time." },
  { title: "Rich listings", text: "Filter by skill, location, work mode, stipend and deadline to find the right fit." },
];

const FACTS = [
  { k: "3", v: "role-based dashboards" },
  { k: "100%", v: "rule-based, explainable matching" },
  { k: "Live", v: "application tracking" },
  { k: "SIH26044", v: "built for the problem statement" },
];

export default function HomePage() {
  return (
    <div className="min-h-svh bg-background">
      {/* ── Nav ── */}
      <header className="glass-bar sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-transform duration-150 active:scale-[0.97]">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground">C</span>
            <span className="text-[16px] font-medium tracking-tight">CareerBridge</span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full bg-foreground/[0.05] p-1 md:flex">
            {[["Internships", "/internships"], ["Roles", "#roles"], ["Features", "#features"]].map(([l, h]) => (
              <Link key={l} href={h} className="rounded-full px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
                {l}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
              Log in
            </Button>
            <Button render={<Link href="/register" />} nativeButton={false}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1200px] px-5 pt-20 pb-12 text-center sm:px-8 sm:pt-28">
          <span className="rise inline-flex items-center rounded-full border border-(--hairline) bg-card/70 px-4 py-1.5 text-[13px] font-medium text-muted-foreground backdrop-blur-md">
            Academia–industry collaboration · SIH26044
          </span>
          <h1 className="rise mx-auto mt-7 max-w-4xl text-[clamp(2.5rem,6.2vw,4.75rem)] font-medium" style={{ "--i": 1 } as React.CSSProperties}>
            Where students, companies and universities meet.
          </h1>
          <p className="rise mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground" style={{ "--i": 2 } as React.CSSProperties}>
            Map your skills, discover internships and track every application — with dashboards built for each side of the table.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
              Get started free
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/internships" />} nativeButton={false}>
              Browse internships
            </Button>
          </div>
        </section>

        {/* ── Product preview ── */}
        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="rise scene overflow-hidden rounded-[34px] border border-(--hairline) p-5 sm:p-8" style={{ "--i": 4 } as React.CSSProperties}>
            <div className="grid gap-5 sm:grid-cols-3">
              <StatTile tone="blue" title="Applications" value={14} pill={{ text: "5 new", variant: "info" }} caption="Across all internships" />
              <StatTile tone="violet" title="Shortlisted" value={4} pill={{ text: "In play", variant: "violet" }} caption="Recruiters are interested" />
              <StatTile tone="mint" title="Selected" value={2} pill={{ text: "Congrats", variant: "success" }} caption="Offers received" />
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="frost rounded-[26px] p-6">
                <p className="text-[15px] font-semibold">Application pipeline</p>
                <SegBars className="mt-5" data={[
                    { label: "Applied", value: 5 },
                    { label: "In review", value: 2 },
                    { label: "Shortlisted", value: 4 },
                    { label: "Selected", value: 2 },
                    { label: "Rejected", value: 1 },
                  ]} />
              </div>
              <div className="frost rounded-[26px] p-6">
                <p className="mb-3 text-[15px] font-semibold">Next steps</p>
                <TaskList
                  highlight={0}
                  items={[
                    { title: "Complete your profile", description: "75% complete", progress: 0.75, href: "/register" },
                    { title: "Add your skills", description: "6 skills added", progress: 1, href: "/register" },
                    { title: "Apply to internships", description: "14 applications sent", progress: 1, href: "/register" },
                  ]}
                />
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Preview with sample data</p>
        </section>

        {/* ── Facts ── */}
        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="grid grid-cols-2 gap-6 border-y border-border py-10 md:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.v} className="text-center">
                <p className="text-[2rem] font-medium tracking-tight">{f.k}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{f.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Roles ── */}
        <section id="roles" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-24 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-medium">Built for every stakeholder</h2>
            <p className="mt-3 text-[17px] text-muted-foreground">Three tailored experiences, one platform.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <div key={r.role} className={cn(r.tone, "tint glass-card flex flex-col rounded-[28px] p-8 [--r:28px]")}>
                <h3 className="text-[1.375rem] font-bold text-(--t-fg)">{r.role}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{r.blurb}</p>
                <ul className="mt-6 space-y-2.5 text-[14px]">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-(--t-fg)" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" size="lg" render={<Link href={r.href} />} nativeButton={false}>
                  {r.cta}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-24 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-medium">Everything you need</h2>
            <p className="mt-3 text-[17px] text-muted-foreground">The complete placement lifecycle, in one place.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={f.title} className="glass-card lift rounded-[26px] p-7">
                <span className="text-[13px] font-semibold text-primary tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[17px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="tone-violet tint glass-card rounded-[34px] px-8 py-16 text-center [--r:34px]">
            <h2 className="mx-auto max-w-2xl text-[clamp(1.9rem,4vw,2.75rem)] font-medium">Ready to bridge the gap?</h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] text-muted-foreground">
              Create your account and see your first dashboard in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
                Create free account
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/internships" />} nativeButton={false}>
                View internships
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-8 text-[13px] text-muted-foreground sm:flex-row sm:px-8">
          <p>
            <span className="font-semibold text-foreground">CareerBridge</span> · SIH26044 · Ministry of Ayush
          </p>
          <p>© 2026 CareerBridge. Built with Django & Next.js.</p>
        </div>
      </footer>
    </div>
  );
}
