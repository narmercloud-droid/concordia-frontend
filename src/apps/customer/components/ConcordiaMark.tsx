import React from "react"

type Props = {
  size?: number
  className?: string
}

/** Concordia emblem — harmony curves over the stone-oven hearth. */
export default function ConcordiaMark({ size = 120, className = "" }: Props) {
  const id = React.useId().replace(/:/g, "")

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Concordia"
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="60" y1="16" x2="60" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c547" />
          <stop offset="1" stopColor="#a67c00" />
        </linearGradient>
        <linearGradient id={`${id}-wine`} x1="60" y1="20" x2="60" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c42a42" />
          <stop offset="1" stopColor="#7a1224" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="60" y1="44" x2="60" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5c5048" />
          <stop offset="1" stopColor="#2e2722" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 74) scale(24 16)">
          <stop stopColor="#f5d76e" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f5d76e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="62" r="50" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6" opacity="0.9" />
      <circle cx="60" cy="62" r="46" fill="none" stroke="#1b7340" strokeWidth="0.8" opacity="0.18" />

      <ellipse cx="60" cy="76" rx="24" ry="15" fill={`url(#${id}-glow)`} />

      <path
        d="M17 80 C27 44, 46 30, 60 27"
        fill="none"
        stroke={`url(#${id}-wine)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M103 80 C93 44, 74 30, 60 27"
        fill="none"
        stroke={`url(#${id}-wine)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="60" cy="27" r="3.8" fill={`url(#${id}-gold)`} />

      <path
        d="M38 90 L38 74 C38 57, 60 45, 82 57 L82 90 Z"
        fill={`url(#${id}-stone)`}
      />
      <path
        d="M44 90 L44 73 C44 62, 60 55, 76 62 L76 90 Z"
        fill="#151311"
        opacity="0.22"
      />
      <path d="M47 90 L47 74 C47 65, 60 59, 73 65 L73 90 Z" fill="#0f0d0c" />

      <path d="M41 82 H79" stroke="#6b5f56" strokeWidth="0.9" opacity="0.45" />
      <path d="M42 86 H78" stroke="#6b5f56" strokeWidth="0.9" opacity="0.35" />

      <path
        d="M60 83 C56.5 77, 53.5 72.5, 56.5 68 C57.8 71.5, 59.2 73, 60 69.5 C60.8 73, 62.2 71.5, 63.5 68 C66.5 72.5, 63.5 77, 60 83Z"
        fill={`url(#${id}-gold)`}
      />
      <path
        d="M60 81 C58.8 76.5, 58.5 73.5, 60 71 C61.5 73.5, 61.2 76.5, 60 81Z"
        fill="#fff8e7"
        opacity="0.55"
      />
    </svg>
  )
}
