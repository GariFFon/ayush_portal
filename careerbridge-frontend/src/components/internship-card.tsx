"use client"

import Link from "next/link"
import { cn } from "cn"

import { MODE_LABEL, type BrowseInternship } from "@/lib/internship-data"
import { OrgAvatar, TickProgress } from "@/components/kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const MODE_VARIANT: Record<string, "success" | "info" | "warning"> = { remote: "success", hybrid: "info", onsite: "warning" }
const CARD_TONES = ["tone-white", "tone-sage", "tone-mist"]

export function daysUntil(deadline: string, now: number) {
  return Math.ceil((new Date(deadline).getTime() - now) / 86_400_000)
}

/** The listing card used on the browse page, in related lists and in the post-job preview. */
export function InternshipCard({
  internship,
  now,
  index = 0,
  onApply,
  preview = false,
  className,
}: {
  internship: BrowseInternship
  now: number
  index?: number
  onApply?: (i: BrowseInternship) => void
  /** Preview mode renders inert buttons (used while posting a job). */
  preview?: boolean
  className?: string
}) {
  const daysLeft = daysUntil(internship.deadline, now)
  const urgent = daysLeft > 0 && daysLeft <= 7
  const href = `/internships/${internship.id}`

  return (
    <div
      className={cn(CARD_TONES[index % CARD_TONES.length], "tint glass-card rise lift flex flex-col rounded-[32px] p-6", className)}
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        <OrgAvatar name={internship.company_name} className="size-12" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] text-muted-foreground">{internship.company_name}</p>
          <h3 className="mt-1 text-[18px] leading-snug font-medium">
            {preview ? internship.title : (
              <Link href={href} className="after:absolute-none hover:underline underline-offset-4">
                {internship.title}
              </Link>
            )}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={MODE_VARIANT[internship.work_mode] ?? "violet"}>{MODE_LABEL[internship.work_mode] ?? internship.work_mode}</Badge>
        {internship.location && <Badge variant="violet">{internship.location}</Badge>}
        <Badge variant="info">{internship.duration_months} mo</Badge>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">Stipend</p>
          <p className="mt-1 text-[2rem] leading-none font-light tracking-[-0.04em] tabular-nums">
            ₹{Number(internship.stipend || 0).toLocaleString("en-IN")}
            <span className="ml-1 text-[14px] tracking-normal text-muted-foreground">/mo</span>
          </p>
        </div>
        <p className="text-right text-[12.5px] text-muted-foreground">
          {internship.openings} opening{internship.openings === 1 ? "" : "s"}
          <br />
          {internship.skills_count} skills
        </p>
      </div>

      <div className="mt-5">
        <TickProgress value={Math.max(0, Math.min(100, (daysLeft / 30) * 100))} color={urgent ? "var(--c-red)" : "var(--foreground)"} ticks={26} className="h-6" />
        <p className={cn("mt-2 text-[12.5px]", urgent ? "font-medium text-[var(--c-red)]" : "text-muted-foreground")}>
          {daysLeft > 0 ? `${daysLeft} days left to apply` : "Deadline passed"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-2.5">
        {preview ? (
          <>
            <Button size="lg" variant="outline" tabIndex={-1} aria-hidden className="pointer-events-none">
              Details
            </Button>
            <Button size="lg" tabIndex={-1} aria-hidden className="pointer-events-none">
              Apply now
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" variant="outline" render={<Link href={href} />} nativeButton={false}>
              Details
            </Button>
            <Button size="lg" onClick={() => onApply?.(internship)} disabled={daysLeft <= 0}>
              Apply now
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
