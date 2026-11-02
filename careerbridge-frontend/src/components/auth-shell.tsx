import Link from "next/link"

import { cn } from "cn"

const FACTS: { title: string; text: string; tone: string }[] = [
  { title: "Skill matching", text: "See how well you fit every internship, and what to learn next.", tone: "tone-blue" },
  { title: "One pipeline", text: "Students, recruiters and universities on the same page.", tone: "tone-violet" },
  { title: "Live tracking", text: "Every application status, updated as it changes.", tone: "tone-mint" },
]

/** Split layout for login / register: brand story on the left, glass form on the right. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto grid min-h-svh max-w-[1200px] items-center gap-16 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_28rem]">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">C</span>
            <span className="text-lg font-medium tracking-tight">CareerBridge</span>
          </Link>
          <h1 className="mt-12 max-w-md text-[3.25rem] font-medium">Your career, bridged.</h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
            Discover internships, map your skills and track every application in one calm, clear place.
          </p>
          <div className="mt-10 grid max-w-md gap-3">
            {FACTS.map((f) => (
              <div key={f.title} className={cn(f.tone, "tint dbl rounded-[20px] border px-5 py-4 [--r:20px]")}>
                <p className="text-[14px] font-semibold text-(--t-fg)">{f.title}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rise rounded-[30px] p-8 [--r:30px] sm:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground">C</span>
            <span className="text-base font-medium tracking-tight">CareerBridge</span>
          </Link>
          <h2 className="text-[1.75rem] leading-tight font-medium tracking-tight">{title}</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </section>
      </div>
    </div>
  )
}
