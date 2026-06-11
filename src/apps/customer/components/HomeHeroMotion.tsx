import React from "react"
import { FOOD_IMAGES } from "@/lib/foodImagery"

/** Slow Ken Burns on the real Kempen kitchen photo — visible oven warmth behind the welcome text. */
export default function HomeHeroMotion() {
  return (
    <div className="home-hero__motion home-hero__motion--kenburns" aria-hidden>
      <img
        src={FOOD_IMAGES.hero}
        alt=""
        className="home-hero__motion-img"
        width={1600}
        height={900}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  )
}
