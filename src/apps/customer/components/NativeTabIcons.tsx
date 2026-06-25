import React from "react"

type IconProps = {
  className?: string
}

export function NativeTabHomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.8 12 4.5l7.5 6.3V19.5a1.2 1.2 0 0 1-1.2 1.2H15v-5.8H9v5.8H5.7a1.2 1.2 0 0 1-1.2-1.2V10.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NativeTabOffersIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 8.5h9M7.5 12h6M7.5 15.5h7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 5.5h12a1.8 1.8 0 0 1 1.8 1.8v9.4a1.8 1.8 0 0 1-1.8 1.8H6A1.8 1.8 0 0 1 4.2 16.7V7.3A1.8 1.8 0 0 1 6 5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="16.8" cy="8.2" r="2.2" fill="currentColor" />
    </svg>
  )
}

export function NativeTabOrderIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 6.2c-2.2 0-4 1.5-4 3.8s1.8 3.8 4 3.8 4-1.5 4-3.8-1.8-3.8-4-3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.2 13.2h13.6l-1.3 7.4a1.6 1.6 0 0 1-1.58 1.4H8.08a1.6 1.6 0 0 1-1.58-1.4l-1.3-7.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.2 4.8h5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function NativeTabAccountIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.8 19.4c1.3-2.8 3.7-4.2 6.2-4.2s4.9 1.4 6.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
