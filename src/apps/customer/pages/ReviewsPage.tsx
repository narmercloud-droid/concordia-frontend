import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import { getBranchGoogleReviews, type BranchGoogleReviewsResponse } from "@/api/customer"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import googleReviewsSnapshot from "@/data/googleReviewsSnapshot.json"

const FALLBACK_REVIEW_KEYS = ["r1", "r2", "r3", "r4", "r5"] as const
const SNAPSHOT_BRANCH_IDS = Object.keys(googleReviewsSnapshot)

function reviewerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function snapshotForBranch(branchId: string, branchName?: string): BranchGoogleReviewsResponse | null {
  const row = googleReviewsSnapshot[branchId as keyof typeof googleReviewsSnapshot]
  if (!row?.reviews?.length) return null
  return {
    branchId,
    branchName,
    source: "snapshot",
    rating: row.rating ?? null,
    reviewCount: row.reviewCount ?? null,
    googleMapsUrl: row.googleMapsUrl ?? null,
    reviews: row.reviews
  }
}

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

function starsFor(rating: number) {
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return "★".repeat(full) + "☆".repeat(5 - full)
}

export default function ReviewsPage() {
  const { t } = useTranslation()
  const { data: branches = [] } = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    ...branchesQueryOptions
  })

  const reviewBranches = useMemo(
    () =>
      branches.filter(
        (b: { id: string; comingSoon?: boolean }) =>
          !b.comingSoon || SNAPSHOT_BRANCH_IDS.includes(b.id)
      ),
    [branches]
  )

  const [branchId, setBranchId] = useState<string | null>(null)
  const activeBranchId = branchId ?? reviewBranches[0]?.id ?? null
  const activeBranch = reviewBranches.find((b: { id: string }) => b.id === activeBranchId)

  const { data: apiReviews, isLoading, isError } = useQuery({
    queryKey: ["googleReviews", activeBranchId],
    queryFn: () => getBranchGoogleReviews(activeBranchId!),
    enabled: !!activeBranchId,
    staleTime: 60 * 60_000,
    retry: 1
  })

  const googleReviews =
    apiReviews ??
    (activeBranchId && isError ? snapshotForBranch(activeBranchId, activeBranch?.name) : null)

  const hasReviewCards = (googleReviews?.reviews.length ?? 0) > 0
  const hasGoogleSummary =
    !!googleReviews && (googleReviews.rating != null || hasReviewCards || !!googleReviews.googleMapsUrl)
  const showLoadError = isError && !googleReviews
  const branchLabel = activeBranch ? branchDisplayName(activeBranch.name) : ""

  return (
    <InfoPageShell eyebrow={t("pages.reviews.eyebrow")} title={t("pages.reviews.title")}>
      <div className="info-block">
        <p>{t("pages.reviews.lead")}</p>
      </div>

      {reviewBranches.length > 1 && (
        <div className="info-reviews__branch-picker" role="tablist" aria-label={t("pages.reviews.branchLabel")}>
          {reviewBranches.map((branch: { id: string; name: string }) => {
            const selected = branch.id === activeBranchId
            return (
              <button
                key={branch.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`info-reviews__branch-btn${selected ? " is-active" : ""}`}
                onClick={() => setBranchId(branch.id)}
              >
                {branchDisplayName(branch.name)}
              </button>
            )
          })}
        </div>
      )}

      {activeBranchId && (
        <div className="info-reviews__summary">
          {isLoading ? (
            <p className="info-reviews__meta">{t("pages.reviews.loading")}</p>
          ) : hasGoogleSummary && googleReviews ? (
            <>
              <p className="info-reviews__rating" aria-label={t("pages.reviews.ratingLabel", { rating: googleReviews.rating ?? 0 })}>
                <span className="info-reviews__rating-stars" aria-hidden="true">
                  {starsFor(googleReviews.rating ?? 5)}
                </span>
                <span className="info-reviews__rating-value">
                  {googleReviews.rating?.toFixed(1)}
                  {googleReviews.reviewCount != null && (
                    <span className="info-reviews__rating-count">
                      {" "}
                      ({t("pages.reviews.reviewCount", { count: googleReviews.reviewCount })})
                    </span>
                  )}
                </span>
              </p>
              {branchLabel && (
                <p className="info-reviews__meta">
                  {t("pages.reviews.branchReviews", { branch: branchLabel })}
                </p>
              )}
              {googleReviews.googleMapsUrl && (
                <a
                  href={googleReviews.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-reviews__maps-link"
                >
                  {t("pages.reviews.viewOnGoogle")}
                </a>
              )}
            </>
          ) : (
            <p className="info-reviews__meta">
              {showLoadError ? t("pages.reviews.loadError") : t("pages.reviews.fallbackNotice", { branch: branchLabel })}
            </p>
          )}
        </div>
      )}

      {hasReviewCards && googleReviews
        ? googleReviews.reviews.map((review, index) => (
            <article key={`${review.author}-${index}`} className="info-review">
              <div className="info-review__header">
                {review.profilePhotoUrl ? (
                  <img
                    src={review.profilePhotoUrl}
                    alt=""
                    className="info-review__avatar"
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="info-review__avatar info-review__avatar--fallback" aria-hidden="true">
                    {reviewerInitials(review.author)}
                  </span>
                )}
                <div className="info-review__identity">
                  <p className="info-review__author">
                    {review.author}
                    {branchLabel ? ` · ${branchLabel}` : ""}
                  </p>
                  {review.relativeTime && (
                    <p className="info-review__time">{review.relativeTime}</p>
                  )}
                </div>
              </div>
              <p className="info-review__stars" aria-label={t("pages.reviews.ratingLabel", { rating: review.rating })}>
                {starsFor(review.rating)}
              </p>
              <p className="info-review__text">"{review.text}"</p>
            </article>
          ))
        : FALLBACK_REVIEW_KEYS.map((key) => (
            <article key={key} className="info-review">
              <p className="info-review__stars" aria-hidden="true">
                ★★★★★
              </p>
              <p className="info-review__text">"{t(`pages.reviews.items.${key}.text`)}"</p>
              <p className="info-review__author">— {t(`pages.reviews.items.${key}.author`)}</p>
            </article>
          ))}
    </InfoPageShell>
  )
}
