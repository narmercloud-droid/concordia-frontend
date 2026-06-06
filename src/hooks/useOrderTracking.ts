import { useEffect } from "react"
import { socket } from "@/lib/socket"
import { joinOrderRoom, leaveOrderRoom } from "@/lib/socket"
import { useQueryClient } from "@tanstack/react-query"

export function useOrderTracking(orderId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    socket.connect()
    joinOrderRoom(orderId)

    socket.on("order_updated", (data) => {
      if (data.id === orderId) {
        queryClient.setQueryData(["order", orderId], (old: any) => ({
          ...old,
          data: { ...old.data, ...data }
        }))
      }
    })

    return () => {
      leaveOrderRoom(orderId)
      socket.off("order_updated")
      socket.disconnect()
    }
  }, [orderId])
}
