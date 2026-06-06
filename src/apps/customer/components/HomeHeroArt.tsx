import React from "react"

export default function HomeHeroArt() {
  return (
    <div className="home-hero-art" aria-hidden="true">
      <svg className="home-hero-art__pizza" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <path
          d="M40 12 L40 40 L58 52"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle cx="48" cy="30" r="2.5" fill="currentColor" opacity="0.3" />
        <circle cx="34" cy="36" r="2" fill="currentColor" opacity="0.25" />
        <circle cx="42" cy="48" r="2" fill="currentColor" opacity="0.25" />
      </svg>

      <svg className="home-hero-art__pasta" viewBox="0 0 80 80" fill="none">
        <path
          d="M18 52c12-18 32-18 44 0M22 46c10-14 26-14 36 0M26 40c8-10 20-10 28 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
        <ellipse cx="40" cy="58" rx="18" ry="6" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
      </svg>

      <svg className="home-hero-art__herbs" viewBox="0 0 80 80" fill="none">
        <path
          d="M40 58V28M40 28c-8-6-16-4-18 4M40 28c8-6 16-4 18 4M40 36c-6-4-12-3-14 2M40 36c6-4 12-3 14 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>

      <svg className="home-hero-art__wine" viewBox="0 0 80 80" fill="none">
        <path
          d="M34 18h12l-4 22c-1 6-5 10-10 10s-9-4-10-10l-4-22z"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.3"
        />
        <path d="M40 50v14M32 64h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.3" />
      </svg>
    </div>
  )
}
