import googleReviewsSnapshot from "@/data/googleReviewsSnapshot.json"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

export type HomeFeaturedReview = {
  author: string
  rating: number
  text: string
  relativeTime?: string
}

export function getKempenFeaturedReviews(): HomeFeaturedReview[] {
  const row = googleReviewsSnapshot[KEMPEN_BRANCH_ID as keyof typeof googleReviewsSnapshot]
  if (!row?.reviews?.length) return []
  return row.reviews.filter((review) => review.rating >= 4)
}
