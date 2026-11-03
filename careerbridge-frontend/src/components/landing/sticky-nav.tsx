"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "cn"

import { BrandMark } from "@/components/brand-mark"
import { Roll, RollLink } from "@/components/landing/roll-link"

const LINKS = [
  { label: "Internships", href: "#internships" },
  { label: "Who it's for", href: "#roles" },
  { label: "Why us", href: "#why" },
]

/** A quiet glass bar that slides in once the hero has scrolled away. */
export function StickyNav() {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.72)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-[4.5rem] items-center justify-between border-b border-(--hairline) bg-card/80 px-5 backdrop-blur-xl transition-transform duration-500 ease-(--ease-drawer) sm:px-10",
        show ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <Link href="/" tabIndex={show ? 0 : -1} className="flex items-center gap-3">
        <BrandMark className="size-10" />
        <span className="text-[19px] font-semibold tracking-tight">CareerBridge</span>
      </Link>
      <nav aria-label="Primary" className="hidden items-center gap-9 text-[15.5px] md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} tabIndex={show ? 0 : -1} className="text-foreground/75 transition-colors hover:text-foreground">
            <Roll>{l.label}</Roll>
          </a>
        ))}
      </nav>
      <RollLink href="/register" className="h-11">
        Sign up
      </RollLink>
    </header>
  )
}
