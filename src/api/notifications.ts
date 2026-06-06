import api from "./client.js"

export const savePushToken = (token: string) =>
  api.post("/notifications/push-token", { token })

export const sendBulkSMS = (data: any) =>
  api.post("/notifications/sms/bulk", data)
