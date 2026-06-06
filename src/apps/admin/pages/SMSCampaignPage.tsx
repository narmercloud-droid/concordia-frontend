import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { sendBulkSMS } from "@/api/notifications"

export default function SMSCampaignPage() {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const sendMutation = useMutation({
    mutationFn: (messageToSend: string) => sendBulkSMS({ message: messageToSend }),
    onSuccess: () => {
      setSuccess("SMS campaign sent successfully.")
      setError("")
      setMessage("")
    },
    onError: () => {
      setError("Failed to send SMS campaign.")
      setSuccess("")
    }
  })

  const handleSend = () => {
    if (message.trim().length < 5) {
      setError("Message too short.")
      setSuccess("")
      return
    }

    setError("")
    setSuccess("")
    sendMutation.mutate(message.trim())
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Bulk SMS Campaign</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Promotional message (e.g., Summer sale - 20% off all items!)"
          style={{
            display: "block",
            width: "100%",
            height: 120,
            padding: 10,
            marginTop: 10,
            fontFamily: "monospace"
          }}
        />
        {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: 8 }}>{success}</p>}
      </div>

      <button
        onClick={handleSend}
        disabled={sendMutation.isPending}
        style={{ padding: "10px 20px", fontSize: 16 }}
      >
        {sendMutation.isPending ? "Sending..." : "Send SMS Campaign"}
      </button>
    </div>
  )
}
