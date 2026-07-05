import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getBranchPaymentStatus,
  startBranchStripeOnboarding,
  updateBranchPaymentSettings
} from "@/api/payments"
import { invalidateCustomerWebsiteCaches } from "@/lib/invalidateCustomerCaches"

type Props = {
  branchId: string
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd"
}

function paymentErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as { response?: { data?: { error?: { message?: string }; message?: string } } })
      .response?.data
    return data?.error?.message ?? data?.message ?? null
  }
  if (error instanceof Error && error.message) return error.message
  return null
}

export default function BranchPaymentAdminSection({ branchId }: Props) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["branchPaymentStatus", branchId],
    queryFn: () => getBranchPaymentStatus(branchId),
    enabled: !!branchId
  })

  const [paypalClientId, setPaypalClientId] = useState("")
  const [paypalClientSecret, setPaypalClientSecret] = useState("")
  const [paypalWebhookId, setPaypalWebhookId] = useState("")

  useEffect(() => {
    if (!data) return
    setPaypalClientId(data.paypalClientId ?? "")
    setPaypalWebhookId(data.paypalWebhookId ?? "")
    setPaypalClientSecret("")
  }, [data])

  const onboardingMutation = useMutation({
    mutationFn: () =>
      startBranchStripeOnboarding(
        branchId,
        `${window.location.origin}/admin/platform-settings`,
        `${window.location.origin}/admin/platform-settings`
      ),
    onSuccess: (result) => {
      if (result.url) window.location.href = result.url
    }
  })

  const flagsMutation = useMutation({
    mutationFn: (payload: {
      cardEnabled?: boolean
      applePayEnabled?: boolean
      googlePayEnabled?: boolean
      paypalEnabled?: boolean
    }) => updateBranchPaymentSettings(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchPaymentStatus", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
    }
  })

  const paypalMutation = useMutation({
    mutationFn: () =>
      updateBranchPaymentSettings(branchId, {
        paypalClientId,
        paypalWebhookId,
        ...(paypalClientSecret.trim() ? { paypalClientSecret: paypalClientSecret.trim() } : {})
      }),
    onSuccess: () => {
      setPaypalClientSecret("")
      queryClient.invalidateQueries({ queryKey: ["branchPaymentStatus", branchId] })
      invalidateCustomerWebsiteCaches(queryClient, branchId)
    }
  })

  if (isLoading) return <p>Loading payment settings…</p>
  if (!data) {
    return (
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #eee" }}>
        <h4>Online payments</h4>
        <p style={{ color: "#b91c1c", fontSize: 14 }}>
          Could not load payment settings
          {isError ? `: ${(error as Error)?.message ?? "request failed"}` : ""}. Try refreshing the
          page or logging in again.
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #eee" }}>
      <h4>Online payments (Stripe)</h4>
      <p style={{ color: "#666", fontSize: 14 }}>
        Each branch has its own Stripe account. Customers can pay by card, Apple Pay, and Google
        Pay at checkout for this branch only.
      </p>

      {!data.stripeConfigured && (
        <p style={{ color: "#b45309" }}>
          Stripe platform keys are not configured on the server yet (`STRIPE_SECRET_KEY` and
          `STRIPE_PUBLISHABLE_KEY`).
        </p>
      )}

      <ul style={{ fontSize: 14, color: "#444", paddingLeft: 18 }}>
        <li>Status: {data.stripeReady ? "Ready for checkout" : "Not ready"}</li>
        <li>Stripe account: {data.stripeAccountId ?? "Not connected"}</li>
        <li>Charges enabled: {data.stripeChargesEnabled ? "Yes" : "No"}</li>
        <li>Payouts enabled: {data.stripePayoutsEnabled ? "Yes" : "No"}</li>
      </ul>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          type="button"
          disabled={!data.stripeConfigured || onboardingMutation.isPending}
          onClick={() => onboardingMutation.mutate()}
          style={{ padding: "8px 14px", borderRadius: 8 }}
        >
          {data.stripeAccountId ? "Continue Stripe setup" : "Connect Stripe for this branch"}
        </button>
        <button
          type="button"
          onClick={() => void refetch()}
          style={{ padding: "8px 14px", borderRadius: 8 }}
        >
          Refresh status
        </button>
      </div>

      {data.stripeReady && (
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ display: "flex", gap: 8 }}>
            <input
              type="checkbox"
              checked={data.cardEnabled}
              onChange={(e) => flagsMutation.mutate({ cardEnabled: e.target.checked })}
            />
            Card payments enabled
          </label>
          <label style={{ display: "flex", gap: 8 }}>
            <input
              type="checkbox"
              checked={data.applePayEnabled}
              onChange={(e) => flagsMutation.mutate({ applePayEnabled: e.target.checked })}
            />
            Apple Pay enabled
          </label>
          <label style={{ display: "flex", gap: 8 }}>
            <input
              type="checkbox"
              checked={data.googlePayEnabled}
              onChange={(e) => flagsMutation.mutate({ googlePayEnabled: e.target.checked })}
            />
            Google Pay enabled
          </label>
        </div>
      )}

      {onboardingMutation.isError && (
        <p style={{ color: "#b91c1c", marginTop: 12 }}>
          Could not start Stripe onboarding.
          {paymentErrorMessage(onboardingMutation.error)
            ? ` ${paymentErrorMessage(onboardingMutation.error)}`
            : " Check server Stripe keys and try again."}
        </p>
      )}

      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #eee" }}>
        <h4>PayPal (this branch only)</h4>
        <p style={{ color: "#666", fontSize: 14 }}>
          Use the PayPal Business account for this restaurant location. Kempen and Straelen should
          each use their own PayPal app credentials from developer.paypal.com.
        </p>

        <ul style={{ fontSize: 14, color: "#444", paddingLeft: 18 }}>
          <li>Status: {data.paypalConfigured ? "Credentials saved" : "Not configured"}</li>
          <li>Secret saved: {data.paypalSecretSet ? "Yes" : "No"}</li>
          <li>Checkout enabled: {data.paypalEnabled ? "Yes" : "No"}</li>
        </ul>

        <div style={{ display: "grid", gap: 12, maxWidth: 520, marginTop: 12 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span>PayPal Client ID</span>
            <input
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              style={fieldStyle}
              autoComplete="off"
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span>PayPal Secret {data.paypalSecretSet ? "(leave blank to keep current)" : ""}</span>
            <input
              type="password"
              value={paypalClientSecret}
              onChange={(e) => setPaypalClientSecret(e.target.value)}
              style={fieldStyle}
              autoComplete="new-password"
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span>PayPal Webhook ID</span>
            <input
              value={paypalWebhookId}
              onChange={(e) => setPaypalWebhookId(e.target.value)}
              style={fieldStyle}
              autoComplete="off"
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <button
            type="button"
            disabled={paypalMutation.isPending}
            onClick={() => paypalMutation.mutate()}
            style={{ padding: "8px 14px", borderRadius: 8 }}
          >
            Save PayPal credentials
          </button>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={data.paypalEnabled}
              disabled={!data.paypalConfigured || flagsMutation.isPending}
              onChange={(e) => flagsMutation.mutate({ paypalEnabled: e.target.checked })}
            />
            Show PayPal at checkout
          </label>
        </div>

        <p style={{ color: "#666", fontSize: 13, marginTop: 12 }}>
          Webhook URL for PayPal:{" "}
          <code>https://api.concordiapizza.de/api/paypal/webhook</code>
        </p>

        {paypalMutation.isError && (
          <p style={{ color: "#b91c1c", marginTop: 12 }}>Could not save PayPal credentials.</p>
        )}
      </div>
    </div>
  )
}
