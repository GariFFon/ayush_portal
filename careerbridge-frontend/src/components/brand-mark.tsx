import { cn } from "cn"

/** The CareerBridge logo (public/logo.png). */
export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="CareerBridge" draggable={false} className={cn("size-12 shrink-0 object-contain", className)} />
  )
}
