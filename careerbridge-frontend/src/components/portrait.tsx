/**
 * Stand-in profile picture: a flat, corporate illustration chosen by the gender
 * picked at sign-up. Used only when the account has no uploaded photo.
 */
export type Gender = "male" | "female" | "other" | ""

export function hasPortrait(g?: string | null): g is "male" | "female" {
  return g === "male" || g === "female"
}

export function Portrait({ gender, className }: { gender: "male" | "female"; className?: string }) {
  const female = gender === "female"
  const skin = "#efc3a2"
  const skinShade = "#e2a985"
  const hair = female ? "#33241f" : "#2a211e"
  return (
    <svg viewBox="0 -70 300 470" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`pbg-${gender}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--pc-3)" }} />
          <stop offset="1" style={{ stopColor: "var(--pc-1)" }} />
        </linearGradient>
        <linearGradient id={`suit-${gender}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3f86" />
          <stop offset="1" stopColor="#262a63" />
        </linearGradient>
      </defs>
      <rect y="-70" width="300" height="470" fill={`url(#pbg-${gender})`} />
      <circle cx="238" cy="92" r="64" fill="#fff" opacity="0.14" />
      <circle cx="46" cy="214" r="46" fill="#fff" opacity="0.1" />

      {/* hair behind */}
      {female ? (
        <path d="M92 196C74 128 112 96 150 96s76 32 58 100c10 56 20 100 4 140H88c-16-40-6-84 4-140z" fill={hair} />
      ) : null}

      {/* shoulders + blazer */}
      <path d="M8 400C8 326 62 296 118 288h64c56 8 110 38 110 112z" fill={`url(#suit-${gender})`} />
      {/* shirt */}
      <path d="M118 288l32 64 32-64z" fill="#f7f8ff" />
      {female ? (
        <path d="M122 288l28 44 28-44" fill="none" stroke="#e5e7fb" strokeWidth="3" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M118 288l32 22 32-22-10-8h-44z" fill="#fff" />
          <path d="M150 312l-9 18 9 58 9-58z" fill="#6c72dd" />
          <path d="M142 306l8 8 8-8-8-6z" fill="#5b61cf" />
        </>
      )}
      {/* lapels */}
      <path d="M118 288L96 400h46l8-48zM182 288l22 112h-46l-8-48z" fill="#2f3475" opacity="0.9" />

      {/* neck */}
      <path d="M134 238h32v52c-8 12-24 12-32 0z" fill={skinShade} />
      <path d="M134 262c10 8 22 8 32 0v-10h-32z" fill="#000" opacity="0.06" />

      {/* ears (male) */}
      {!female && (
        <>
          <ellipse cx="103" cy="204" rx="7" ry="12" fill={skin} />
          <ellipse cx="197" cy="204" rx="7" ry="12" fill={skin} />
        </>
      )}

      {/* face */}
      <ellipse cx="150" cy="198" rx="48" ry="58" fill={skin} />
      <ellipse cx="128" cy="222" rx="9" ry="6" fill="#e58f86" opacity="0.28" />
      <ellipse cx="172" cy="222" rx="9" ry="6" fill="#e58f86" opacity="0.28" />

      {/* hair front */}
      {female ? (
        <path d="M100 196c-6-52 24-82 58-80 30 2 46 28 44 80-8-30-26-46-52-48-24 0-42 18-50 48z" fill={hair} />
      ) : (
        <path d="M102 192c-8-52 18-82 50-82 34 0 56 30 46 82-6-24-14-38-30-44-20-6-46 0-66 44z" fill={hair} />
      )}

      {/* face details */}
      <circle cx="132" cy="206" r="3.4" fill="#2a1d1a" />
      <circle cx="168" cy="206" r="3.4" fill="#2a1d1a" />
      <path d="M121 194q11-6 22 0M157 194q11-6 22 0" fill="none" stroke={hair} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M150 208v14q-5 3-9 0" fill="none" stroke={skinShade} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M136 234q14 12 28 0" fill="none" stroke={female ? "#b5524f" : "#a45a4a"} strokeWidth="3.4" strokeLinecap="round" />
      {female && (
        <>
          <circle cx="104" cy="226" r="3.6" fill="#f4f2ff" />
          <circle cx="196" cy="226" r="3.6" fill="#f4f2ff" />
        </>
      )}
    </svg>
  )
}
