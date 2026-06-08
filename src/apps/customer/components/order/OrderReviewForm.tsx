import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { submitOrderReview, type OrderReview } from "@/api/reviews"
import { useAuthStore } from "@/context/authStore"
import "./OrderReviewForm.css"

type Props = {
  orderId: string
  fulfillmentType?: string | null
  existingReview?: OrderReview | null
  onSubmitted?: () => void
}

function StarRow({
  label,
  value,
  onChange
}: {
  label: string
  value: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="order-review__stars-row">
      <span className="order-review__stars-label">{label}</span>
      <div className="order-review__stars" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            className={`order-review__star${value >= star ? " is-active" : ""}`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

export default function OrderReviewForm({
  orderId,
  fulfillmentType,
  existingReview,
  onSubmitted
}: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isLoggedIn = !!useAuthStore((s) => s.user)
  const isDelivery = fulfillmentType === "delivery"

  const [foodRating, setFoodRating] = useState(existingReview?.foodRating ?? 0)
  const [deliveryRating, setDeliveryRating] = useState(existingReview?.deliveryRating ?? 0)
  const [comment, setComment] = useState(existingReview?.comment ?? "")
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      submitOrderReview(
        {
          orderId,
          foodRating,
          deliveryRating: isDelivery ? deliveryRating : null,
          comment: comment.trim() || undefined
        },
        !isLoggedIn
      ),
    onSuccess: () => {
      setError("")
      queryClient.invalidateQueries({ queryKey: ["orderStatus", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orderReview", orderId] })
      queryClient.invalidateQueries({ queryKey: ["my-orders"] })
      onSubmitted?.()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? err?.response?.data?.error ?? t("orderReview.submitError"))
    }
  })

  if (existingReview) {
    return (
      <div className="order-review order-review--submitted">
        <h3 className="customer-subtitle">{t("orderReview.thanksTitle")}</h3>
        <p className="customer-hint">{t("orderReview.thanksBody")}</p>
        <StarRow label={t("orderReview.foodLabel")} value={existingReview.foodRating} onChange={() => {}} />
        {isDelivery && existingReview.deliveryRating != null && (
          <StarRow
            label={t("orderReview.deliveryLabel")}
            value={existingReview.deliveryRating}
            onChange={() => {}}
          />
        )}
        {existingReview.comment && (
          <p className="order-review__comment">"{existingReview.comment}"</p>
        )}
      </div>
    )
  }

  const canSubmit =
    foodRating >= 1 && foodRating <= 5 && (!isDelivery || (deliveryRating >= 1 && deliveryRating <= 5))

  return (
    <div className="order-review">
      <h3 className="customer-subtitle">{t("orderReview.title")}</h3>
      <p className="customer-hint">{t("orderReview.lead")}</p>

      <StarRow label={t("orderReview.foodLabel")} value={foodRating} onChange={setFoodRating} />
      {isDelivery && (
        <StarRow
          label={t("orderReview.deliveryLabel")}
          value={deliveryRating}
          onChange={setDeliveryRating}
        />
      )}

      <label className="order-review__comment-label" htmlFor={`review-comment-${orderId}`}>
        {t("orderReview.commentLabel")}
      </label>
      <textarea
        id={`review-comment-${orderId}`}
        className="order-review__textarea"
        rows={4}
        maxLength={2000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("orderReview.commentPlaceholder")}
      />

      {!isLoggedIn && (
        <p className="customer-hint">{t("orderReview.guestHint")}</p>
      )}

      {error && <p className="customer-alert customer-alert--error">{error}</p>}

      <button
        type="button"
        className="customer-btn customer-btn--primary"
        disabled={!canSubmit || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? t("orderReview.submitting") : t("orderReview.submit")}
      </button>
    </div>
  )
}
