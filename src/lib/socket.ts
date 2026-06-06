import { io } from "socket.io-client"

export const socket = io(
  import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL,
  {
  autoConnect: false,
  withCredentials: true
  }
)

export function joinOrderRoom(orderId: string) {
  socket.emit("join_order", { orderId })
}

export function leaveOrderRoom(orderId: string) {
  socket.emit("leave_order", { orderId })
}

export default socket
