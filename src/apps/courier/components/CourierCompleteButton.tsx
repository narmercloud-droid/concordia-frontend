import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeCourierOrder } from "@/api/courierOrder.js"
import { removeCourierRouteToken } from "@/lib/courierRoute.js"

type Props = {
  token: string
  disabled?: boolean
  compact?: boolean
  onCompleted?: () => void
}

export default function CourierCompleteButton({
  token,
  disabled = false,
  compact = false,
  onCompleted
}: Props) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const mutation = useMutation({
    mutationFn: () => completeCourierOrder(token),
    onSuccess: () => {
      removeCourierRouteToken(token)
      void queryClient.invalidateQueries({ queryKey: ["courierOrder", token] })
      void queryClient.invalidateQueries({ queryKey: ["courierRoute"] })
      setConfirming(false)
      onCompleted?.()
    }
  })

  const handleComplete = () => {
    if (confirming) {
      mutation.mutate()
      return
    }
    setConfirming(true)
  }

  const cancelConfirm = () => setConfirming(false)

  if (compact) {
    return (
      <div className="courier-complete courier-complete--compact">
        {!confirming ? (
          <button
            type="button"
            className="courier-btn courier-btn--complete"
            disabled={disabled || mutation.isPending}
            onClick={handleComplete}
          >
            Complete
          </button>
        ) : (
          <div className="courier-complete__confirm">
            <button
              type="button"
              className="courier-btn courier-btn--complete"
              disabled={mutation.isPending}
              onClick={handleComplete}
            >
              {mutation.isPending ? "Completing…" : "Confirm"}
            </button>
            <button type="button" className="courier-btn" onClick={cancelConfirm} disabled={mutation.isPending}>
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="courier-complete">
      {!confirming ? (
        <button
          type="button"
          className="courier-btn courier-btn--complete courier-btn--block"
          disabled={disabled || mutation.isPending}
          onClick={handleComplete}
        >
          Complete delivery
        </button>
      ) : (
        <div className="courier-complete__panel">
          <p className="courier-complete__question">Mark this order as delivered?</p>
          <button
            type="button"
            className="courier-btn courier-btn--complete courier-btn--block"
            disabled={mutation.isPending}
            onClick={handleComplete}
          >
            {mutation.isPending ? "Completing…" : "Yes, complete"}
          </button>
          <button
            type="button"
            className="courier-btn courier-btn--block"
            onClick={cancelConfirm}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        </div>
      )}
      {mutation.isError && (
        <p className="courier-feedback courier-feedback--error">Could not complete. Try again.</p>
      )}
    </div>
  )
}
