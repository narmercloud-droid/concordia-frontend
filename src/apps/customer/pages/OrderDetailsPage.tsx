import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getOrder } from "@/api/order"
import { useOrderTracking } from "@/hooks/useOrderTracking"
import Button from "@/components/ui/Button"
import { useCartStore, type CartSelection } from "@/store/cartStore"
import { translateOrderStatus } from "@/utils/translateStatus"

function mapSelections(raw: unknown): CartSelection[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null
      const row = entry as Record<string, unknown>
      const id = String(row.id ?? row.name ?? "")
      const name = String(row.name ?? row.value ?? row.label ?? id)
      const price = Number(row.price ?? 0)
      if (!id || !name) return null
      return { id, name, price }
    })
    .filter((entry): entry is CartSelection => entry !== null)
}

export default function OrderDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orderId } = useParams()

  useOrderTracking(orderId!)

  const addItem = useCartStore((s) => s.addItem)

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!)
  })

  if (isLoading) return <div>{t("order.loading")}</div>

  const order = data?.data
  if (!order) return <div>{t("common.notFound")}</div>

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
        {order.items.map((i: { itemId?: number; id?: number; name: string; quantity: number }) => (
          <li key={String(i.itemId ?? i.id ?? i.name)}>
            {i.name} x {i.quantity}
          </li>
        ))}
      </ul>

      <Button
        onClick={() => {
          const branchId = String(order.branchId ?? "")
          if (!branchId) return

          order.items.forEach((line: Record<string, unknown>) => {
            const itemId = Number(line.itemId ?? line.id)
            if (!itemId) return

            addItem({
              id: itemId,
              branchId,
              name: String(line.name ?? ""),
              unitPrice: Number(line.unitPrice ?? line.price ?? 0),
              quantity: Number(line.quantity ?? 1),
              variants: mapSelections(line.variants),
              addOns: mapSelections(line.extras ?? line.addOns),
              notes: typeof line.notes === "string" ? line.notes : undefined
            })
          })
          navigate("/customer/cart")
        }}
      >
        {t("order.reorder")}
      </Button>
    </div>
  )
}
