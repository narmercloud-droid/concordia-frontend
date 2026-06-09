import axios from "axios"

export function getApiErrorMessage(err: unknown): string | null {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error && err.message ? err.message : null
  }

  const data = err.response?.data
  if (!data) return null

  if (typeof data === "string" && data.trim()) {
    return data.trim()
  }

  if (typeof data !== "object") return null

  const body = data as {
    error?: string | { message?: string }
    message?: string
  }

  if (typeof body.error === "string" && body.error.trim()) {
    return body.error.trim()
  }

  if (body.error && typeof body.error === "object" && typeof body.error.message === "string") {
    return body.error.message
  }

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message
  }

  return null
}

export function getOrderIdFromPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined

  const record = payload as Record<string, unknown>
  if (typeof record.id === "string" && record.id) return record.id
  if (typeof record.orderId === "string" && record.orderId) return record.orderId

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>
    if (typeof nested.id === "string" && nested.id) return nested.id
    if (typeof nested.orderId === "string" && nested.orderId) return nested.orderId
  }

  return undefined
}
