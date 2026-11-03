"use client"

import * as React from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * One place for all landing-page motion: Lenis smooth scrolling driven by GSAP's ticker,
 * ScrollTrigger-scrubbed parallax, masked line reveals, word-by-word "reading" text,
 * stacked cards and counters. Markup stays declarative — sections opt in via data attributes:
 *
 *   data-intro="line|fade|tile"   entrance on load
 *   data-parallax="0.2"           drifts at a different speed from the page
 *   data-mask                     children .mask-line > span slide up when scrolled into view
 *   data-read                     words (.read-word) fill in as you scroll through the paragraph
 *   data-hscroll                  pinned section: vertical scroll drives a horizontal track (desktop)
 *   data-hpar="0.3"               layer inside it that drifts at its own speed
 *   data-stack                    sticky cards that scale back as the next one arrives
 *   data-curtain                  stays pinned and recedes (scale/fade) while the next section slides over it
 *   data-count="1200"             number counts up when seen
 *   data-draw                     an svg path draws itself
 */
export function LandingMotion() {
  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const root = document.documentElement
    const mm = gsap.matchMedia()

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 900px)" },
      (ctx) => {
        const { wide } = ctx.conditions as { motion: boolean; wide: boolean }

        // ── Smooth scrolling (Lenis) wired to GSAP's clock ──
        const lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -90 } })
        lenis.on("scroll", ScrollTrigger.update)
        const tick = (t: number) => lenis.raf(t * 1000)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)

        // ── Entrance ──
        const intro = gsap.timeline({ defaults: { ease: "power4.out" } })
        intro
          .from("[data-intro='line'] > span", { yPercent: 118, duration: 1.15, stagger: 0.12 }, 0.1)
          .from("[data-intro='fade']", { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.45)
          .from("[data-intro='tile']", { scale: 0.55, autoAlpha: 0, rotate: -16, duration: 1.1, stagger: 0.14, ease: "back.out(1.5)" }, 0.55)
        root.classList.add("motion-ready")

        // ── Parallax: each layer drifts at its own pace ──
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = parseFloat(el.dataset.parallax || "0.2") * (wide ? 1 : 0.5)
          gsap.fromTo(
            el,
            { yPercent: -speed * 60 },
            { yPercent: speed * 60, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
          )
        })

        // ── Masked line reveals ──
        gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) => {
          gsap.from(el.querySelectorAll(".mask-line > span"), {
            yPercent: 115,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          })
        })

        // ── "Reading" text: words light up as you scroll through them ──
        gsap.utils.toArray<HTMLElement>("[data-read]").forEach((el) => {
          const scope = (el.closest("[data-read-scope]") as HTMLElement | null) ?? el
          const pinned = scope !== el
          gsap.fromTo(
            el.querySelectorAll(".read-word"),
            { opacity: 0.14 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.2,
              scrollTrigger: pinned
                ? { trigger: scope, start: "top 20%", end: "bottom 215%", scrub: 0.5 }
                : { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 },
            }
          )
        })

        // ── Horizontal scroll: the page pins, the track slides sideways, layers drift at their own speed ──
        if (wide) {
          gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((section) => {
            const track = section.querySelector<HTMLElement>(".h-track")
            if (!track) return
            const segs = Array.from(section.querySelectorAll<HTMLElement>(".h-seg"))
            const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
            // CSS-sticky pin (no JS pin, so no flicker); a short hold at each end makes the hand-off to vertical scrolling calm
            const travel = () => dist() * 1.75
            const setHeight = () => {
              section.style.height = `${travel() + window.innerHeight}px`
            }
            setHeight()
            ScrollTrigger.addEventListener("refreshInit", setHeight)
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: section,
                scrub: 0.4,
                start: "top top",
                end: "bottom bottom",
                invalidateOnRefresh: true,
                onUpdate: () => {
                  const x = -(gsap.getProperty(track, "x") as number)
                  const allPanels = Array.from(section.querySelectorAll<HTMLElement>(".h-panel"))
                  const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-seg]"))
                  // parallax: each layer drifts by how far its panel is from the middle of the screen
                  allPanels.forEach((pn) => {
                    const rel = (pn.offsetLeft - x + pn.offsetWidth / 2 - window.innerWidth / 2) / window.innerWidth
                    pn.querySelectorAll<HTMLElement>("[data-hpar]").forEach((layer) => {
                      const speed = parseFloat(layer.dataset.hpar || "0.3")
                      gsap.set(layer, { x: rel * speed * 340 })
                    })
                  })
                  segs.forEach((seg, i) => {
                    const pn = panels[i]
                    if (!pn) return
                    const f = (x + window.innerWidth * 0.5 - pn.offsetLeft) / pn.offsetWidth
                    gsap.set(seg, { scaleX: Math.max(0, Math.min(1, f)) })
                  })
                },
              },
            })
            tl.to(track, { x: () => -dist(), duration: 1, ease: "none" })
          })
        }

        // ── Stacked cards ──
        gsap.utils.toArray<HTMLElement>("[data-stack]").forEach((wrap) => {
          const cards = gsap.utils.toArray<HTMLElement>(".stack-card", wrap)
          cards.forEach((card, i) => {
            const next = cards[i + 1]
            if (!next) return
            gsap.to(card.querySelector(".stack-inner"), {
              scale: 0.93,
              yPercent: -3,
              ease: "none",
              scrollTrigger: { trigger: next, start: "top 85%", end: "top 24%", scrub: true },
            })
          })
        })

        // ── Curtain: nothing to animate — the section simply stays pinned and the next one slides over it ──

        // ── Counters ──
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = parseFloat(el.dataset.count || "0")
          const suffix = el.dataset.suffix || ""
          const state = { v: 0 }
          gsap.to(state, {
            v: target,
            duration: 1.8,
            ease: "power3.out",
            onUpdate: () => (el.textContent = Math.round(state.v).toLocaleString("en-IN") + suffix),
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          })
        })

        // ── Hand-drawn strokes ──
        gsap.utils.toArray<SVGPathElement>("[data-draw]").forEach((path) => {
          const len = path.getTotalLength()
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
          gsap.to(path, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: path, start: "top 85%", once: true } })
        })

        const refresh = () => ScrollTrigger.refresh()
        document.fonts?.ready.then(refresh)
        window.addEventListener("load", refresh)

        return () => {
          document.querySelectorAll<HTMLElement>("[data-hscroll]").forEach((n) => (n.style.height = ""))
          window.removeEventListener("load", refresh)
          gsap.ticker.remove(tick)
          lenis.destroy()
          root.classList.remove("motion-ready")
        }
      }
    )

    // Reduced motion: everything is simply visible.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      root.classList.add("motion-ready", "reduced-motion")
      return () => root.classList.remove("motion-ready", "reduced-motion")
    })

    return () => mm.revert()
  }, [])

  return null
}
