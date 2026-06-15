import { io } from "socket.io-client"
import { resolveSocketUrl } from "@/api/client"

export const socket = io(resolveSocketUrl(), {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 1500,
  reconnectionDelayMax: 10000,
  timeout: 20000
})

export function joinOrderRoom(orderId: string) {
  socket.emit("join_order", { orderId })
}

export function leaveOrderRoom(orderId: string) {
  socket.emit("leave_order", { orderId })
}

export default socket
