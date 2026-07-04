import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { sendMarketingSMS } from "@/api/notifications"
import { useAdminBranch } from "@/hooks/useAdminBranch"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"

export default function SMSCampaignPage() {
  const { branchId, branchName } = useAdminBranch()
  const { can } = useAdminPermissions()
  const [message, setMessage] = useState("")
  const [segment, setSegment] = useState<"all" | "recent">("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const sendMutation = useMutation({
    mutationFn: () =>
      sendMarketingSMS({
        message: message.trim(),
        branchId: branchId!,
        segment
      }),
    onSuccess: (res) => {
      const sent = res.data?.sent ?? 0
      const total = res.data?.total ?? sent
      setSuccess(`SMS sent to ${sent} of ${total} opted-in customers.`)
      setError("")
      setMessage("")
    },
    onError: (err: { response?: { data?: { error?: string; message?: string } } }) => {
      const msg =
        err.response?.data?.error ??
        err.response?.data?.message ??
        "Failed to send SMS campaign."
      setError(msg)
      setSuccess("")
    }
  })

  if (!can("customers_automation")) {
    return (
      <div style={{ padding: 20 }}>
        <h2>SMS campaigns</h2>
        <p>You do not have permission to send marketing SMS.</p>
      </div>
    )
  }

  const handleSend = () => {
    if (!branchId) {
      setError("Select a branch first.")
      return
    }
    if (message.trim().length < 5) {
      setError("Message must be at least 5 characters.")
      setSuccess("")
      return
    }

    setError("")
    setSuccess("")
    sendMutation.mutate()
  }

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2>SMS campaigns</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Sends only to customers who opted in to marketing SMS for{" "}
        <strong>{branchName ?? branchId}</strong>. Use the branch switcher above to change branch.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="sms-segment">Audience</label>
        <select
          id="sms-segment"
          value={segment}
          onChange={(e) => setSegment(e.target.value as "all" | "recent")}
          style={{ display: "block", marginTop: 8, padding: 8, minWidth: 280 }}
        >
          <option value="all">All SMS marketing opt-ins</option>
          <option value="recent">Ordered in the last 30 days</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="sms-message">Message</label>
        <textarea
          id="sms-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Promotional message (e.g., Summer sale – 20% off all items!)"
          style={{
            display: "block",
            width: "100%",
            height: 120,
            padding: 10,
            marginTop: 8,
            fontFamily: "inherit"
          }}
        />
        {error && <p style={{ color: "#c0392b", marginTop: 8 }}>{error}</p>}
        {success && <p style={{ color: "#27ae60", marginTop: 8 }}>{success}</p>}
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={sendMutation.isPending || !branchId}
        style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}
      >
        {sendMutation.isPending ? "Sending…" : "Send SMS campaign"}
      </button>
    </div>
  )
}
