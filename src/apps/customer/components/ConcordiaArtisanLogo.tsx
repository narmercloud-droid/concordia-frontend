import React from "react"

type Props = {
  className?: string
  width?: number
}

/** Transparent artisan logo — pizza, pasta, oven icons + Concordia wordmark. */
export default function ConcordiaArtisanLogo({ className = "", width = 420 }: Props) {
  const height = Math.round(width * 0.48)
  const id = React.useId().replace(/:/g, "")

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 200"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Concordia Restaurant"
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a82a" />
          <stop offset="100%" stopColor="#b8891a" />
        </linearGradient>
      </defs>

      {/* Pizza */}
      <g transform="translate(118 18)" stroke="#8B1A2B" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 38 L34 6 A38 38 0 0 1 72 38 Z" />
        <circle cx="22" cy="28" r="3.5" fill="#8B1A2B" stroke="none" />
        <circle cx="38" cy="22" r="3" fill="#8B1A2B" stroke="none" />
        <path d="M30 14 C32 10 36 8 40 10" strokeWidth="1.8" />
      </g>

      {/* Pasta */}
      <g transform="translate(188 20)" stroke={`url(#${id}-gold)`} strokeWidth="2" fill="none" strokeLinecap="round">
        <ellipse cx="22" cy="30" rx="24" ry="10" />
        <path d="M6 24 C10 10 18 4 22 4 C26 4 34 10 38 24" />
        <path d="M10 20 C14 12 18 8 22 8" />
        <path d="M14 16 C17 11 20 9 22 9" />
        <path d="M22 2 C24 0 27 2 26 5" stroke="#2d5a3d" strokeWidth="1.6" />
      </g>

      {/* Stone oven */}
      <g transform="translate(278 18)" stroke="#2d5a3d" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 38 L8 22 C8 10 22 4 34 10 C46 4 60 10 60 22 L60 38 Z" />
        <path d="M14 38 L14 24 C14 16 24 12 34 14 C44 12 54 16 54 24 L54 38" />
        <path d="M30 30 C28 24 28 20 30 18 C32 20 32 24 30 30Z" fill="#d4a82a" stroke="none" />
      </g>

      {/* Concordia script-style */}
      <text
        x="210"
        y="118"
        textAnchor="middle"
        fill="#8B1A2B"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="58"
        fontStyle="italic"
        fontWeight="600"
        letterSpacing="1"
      >
        Concordia
      </text>

      {/* Restaurant */}
      <text
        x="210"
        y="142"
        textAnchor="middle"
        fill="#2d5a3d"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="6"
      >
        RESTAURANT
      </text>

      {/* Italian flag brush stroke */}
      <path d="M118 168 C150 162 178 174 210 166 C242 158 270 172 302 166" stroke="#2d5a3d" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      <path d="M168 168 C188 164 198 170 210 166" stroke="#f5f5f0" strokeWidth="4" strokeLinecap="round" />
      <path d="M228 166 C248 170 268 162 288 168" stroke="#8B1A2B" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}
