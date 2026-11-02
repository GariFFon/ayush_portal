"use client"

import * as React from "react"

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

/**
 * Counts from 0 to `value` with an ease-out curve (fast start, soft landing).
 * Under prefers-reduced-motion it jumps straight to the value.
 */
export function CountUp({
  value,
  duration = 900,
  delay = 0,
}: {
  value: number
  duration?: number
  delay?: number
}) {
  const [t, setT] = React.useState(0)

  React.useEffect(() => {
    let raf = 0
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(() => setT(1))
      return () => cancelAnimationFrame(raf)
    }
    let start: number | null = null
    const timeout = window.setTimeout(() => {
      const tick = (now: number) => {
        if (start === null) start = now
        const p = Math.min((now - start) / duration, 1)
        setT(p)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(raf)
    }
  }, [duration, delay])

  return <>{Math.round(value * easeOutExpo(t)).toLocaleString("en-IN")}</>
}
