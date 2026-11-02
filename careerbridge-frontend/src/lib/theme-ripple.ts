"use client"

import { useTheme } from "next-themes"

/**
 * Drop-in replacement for next-themes' setTheme that plays a soft circular
 * wave from the centre of the screen (View Transitions API). Falls back to an
 * instant switch for reduced motion or browsers without support.
 */
export function useThemeRipple() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const change = (next: string) => {
    const root = document.documentElement
    const wantsDark =
      next === "dark" || (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    const willChange = wantsDark !== (resolvedTheme === "dark")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition

    if (!willChange || reduce || !vt) {
      setTheme(next)
      return
    }
    root.classList.add("theme-ripple")
    const transition = vt.call(document, () => {
      // Flip the class inside the snapshot window, then persist via next-themes.
      root.classList.toggle("dark", wantsDark)
      root.style.colorScheme = wantsDark ? "dark" : "light"
      setTheme(next)
    })
    transition.finished.finally(() => root.classList.remove("theme-ripple"))
  }

  return { theme, setTheme: change }
}
