import { cn } from "cn"

/**
 * A faint dotted grid, gently bent as if drawn on paper that has been pressed:
 * lines and dots are displaced by a smooth wave, then faded out toward the edges
 * with a mask. Purely decorative and static, so it costs nothing at runtime.
 */
const W = 1600
const H = 900
const COLS = 24
const ROWS = 11

function warp(x: number, y: number): [number, number] {
  const nx = x / W
  const ny = y / H
  // a soft bulge near the middle plus a slow wave
  const bulge = Math.exp(-(((nx - 0.5) / 0.38) ** 2 + ((ny - 0.5) / 0.55) ** 2))
  const dx = 46 * Math.sin(ny * 5.2 + nx * 2.1) * bulge + 18 * Math.sin(ny * 9 + 1.3) * bulge
  const dy = 40 * Math.cos(nx * 4.6 - ny * 1.7) * bulge - 26 * (nx - 0.5) * bulge
  return [x + dx, y + dy]
}

function line(points: [number, number][]) {
  return "M" + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")
}

const SAMPLES = 36
const vertical = Array.from({ length: COLS + 1 }, (_, c) => {
  const x = (c / COLS) * W
  return line(Array.from({ length: SAMPLES + 1 }, (_, i) => warp(x, (i / SAMPLES) * H)))
})
const horizontal = Array.from({ length: ROWS + 1 }, (_, r) => {
  const y = (r / ROWS) * H
  return line(Array.from({ length: SAMPLES + 1 }, (_, i) => warp((i / SAMPLES) * W, y)))
})
const dots: [number, number][] = []
for (let c = 0; c <= COLS; c++) for (let r = 0; r <= ROWS; r++) dots.push(warp((c / COLS) * W, (r / ROWS) * H))

export function WarpGrid({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "pointer-events-none size-full [mask-image:linear-gradient(to_bottom,transparent,#000_24%,#000_76%,transparent)]",
        className
      )}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1">
        {vertical.map((d, i) => (
          <path key={`v${i}`} d={d} />
        ))}
        {horizontal.map((d, i) => (
          <path key={`h${i}`} d={d} />
        ))}
      </g>
      <g fill="currentColor" fillOpacity="0.28">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="1.6" />
        ))}
      </g>
    </svg>
  )
}
