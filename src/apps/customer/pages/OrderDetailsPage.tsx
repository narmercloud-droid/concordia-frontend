import React from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getOrder } from "@/api/order"
import { useOrderTracking } from "@/hooks/useOrderTracking"
import Button from "@/components/ui/Button"
import { useCartStore } from "@/context/cartStore"
import { translateOrderStatus } from "@/utils/translateStatus"

export default function OrderDetailsPage() {
  const { t } = useTranslation()
  const { orderId } = useParams()

  useOrderTracking(orderId!)

  const addItem = useCartStore((s) => s.addItem)

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!)
  })

  if (isLoading) return <div>{t("order.loading")}</div>

  const order = data?.data

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2>{t("order.orderNumber", { id: order.id })}</h2>

      <div>
        <strong>{t("order.status")}:</strong> {translateOrderStatus(order.status, t)}
      </div>

      {order.eta && (
        <div>
          <strong>{t("order.etaMinutes", { min: order.eta })}</strong>
        </div>
      )}

      {order.courier && (
        <div>
          <strong>{t("order.driver")}:</strong> {order.courier.name}
        </div>
      )}

      <h3>{t("order.itemsTitle")}</h3>
      <ul>
        {order.items.map((i: any) => (
          <li key={i.itemId}>
            {i.name} x {i.quantity}
          </li>
        ))}
      </ul>

      <Button
        onClick={() => {
          order.items.forEach((i: any) => {
            addItem({
              id: i.itemId,
              name: i.name,
              price: i.price,
              description: "",
              image: "",
              categoryId: ""
            })
          })
        }}
      >
        {t("order.reorder")}
      </Button>
    </div>
  )
}
