"use client"

import { useCallback, useEffect, useState } from "react"

import { getInternships } from "@/lib/api"
import { DEMO_ENABLED } from "@/lib/demo"
import { makeSample, type BrowseInternship } from "@/lib/internship-data"

/** Public internship listings, falling back to sample listings when the portal is empty. */
export function useJobs() {
  const [jobs, setJobs] = useState<BrowseInternship[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getInternships()
      .then((d) => {
        if (!alive) return
        const list = (Array.isArray(d) ? d : ((d as { results?: BrowseInternship[] }).results ?? [])) as BrowseInternship[]
        if (list.length === 0 && DEMO_ENABLED) {
          setJobs(makeSample())
          setIsDemo(true)
        } else setJobs(list)
      })
      .catch(() => {
        if (!alive || !DEMO_ENABLED) return
        setJobs(makeSample())
        setIsDemo(true)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return { jobs, isDemo, loading }
}

const KEY = "cb_saved_jobs"
const EVENT = "cb-saved-jobs"

const read = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as number[]
  } catch {
    return []
  }
}

/** Bookmarked jobs, kept in localStorage and shared across widgets on the page. */
export function useSavedJobs() {
  const [ids, setIds] = useState<number[]>([])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIds(read()))
    const sync = () => setIds(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener(EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const toggle = useCallback((id: number) => {
    const cur = read()
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {}
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return { ids, toggle, has: (id: number) => ids.includes(id) }
}
