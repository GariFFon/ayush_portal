"use client"

import { useEffect, useState } from "react"

import { DEMO_ENABLED } from "@/lib/demo"

/**
 * Loads real dashboard stats; when the API is empty or unreachable, falls
 * back to sample data and reports `isDemo` so the UI can say so.
 */
export function useDashboardData<T>(fetcher: () => Promise<unknown>, demo: T, isEmpty: (v: T) => boolean) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    let alive = true
    fetcher()
      .then((res) => {
        if (!alive) return
        const real = res as T
        if (DEMO_ENABLED && isEmpty(real)) {
          setData(demo)
          setIsDemo(true)
        } else {
          setData(real)
        }
      })
      .catch((err) => {
        console.error(err)
        if (!alive) return
        if (DEMO_ENABLED) {
          setData(demo)
          setIsDemo(true)
        }
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, isDemo }
}
