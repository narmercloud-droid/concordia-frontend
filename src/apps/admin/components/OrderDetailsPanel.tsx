import React, { useEffect, useState } from "react"
import { assignCourier, updateOrderStatus } from "@/api/adminOrders"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getStaff } from "@/api/staff"
export default function OrderDetailsPanel({ order, onClose }: any) {
  const queryClient = useQueryClient()
  const { data: staff } = useQuery({ queryKey: ["staff"], queryFn: getStaff })
  const [courierId, setCourierId] = useState(order?.courierId || "")
  const [status, setStatus] = useState(order?.status || "")

  useEffect(() => {
    setCourierId(order?.courierId || "")
    setStatus(order?.status || "")
  }, [order])
const assignMutation = useMutation({
  mutationFn: () => assignCourier(order.id, courierId),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
})
const statusMutation = useMutation({
  mutationFn: () => updateOrderStatus(order.id, status),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
})
if (!order) return null
return (
<div
style={{
position: "fixed",
right: 0,
top: 0,
width: 380,
height: "100vh",
background: "white",
borderLeft: "1px solid #ddd",
padding: 20,
overflowY: "auto"
}}
>
<button onClick={onClose} style={{ marginBottom: 20 }}>
Close
</button>
<h2>Order #{order.id}</h2>
<h3>Customer</h3>
<p>{order.customerName}</p>
<h3>Items</h3>
<ul>
{order.items.map((i: any) => (
<li key={i.id}>
{i.name} × {i.quantity}
</li>
))}
</ul>
<h3>Status</h3>
<select value={status} onChange={(e) => setStatus(e.target.value)}>
<option value="pending">Pending</option>
<option value="accepted">Accepted</option>
<option value="preparing">Preparing</option>
<option value="ready">Ready</option>
<option value="picked_up">Picked Up</option>
<option value="delivered">Delivered</option>
</select>
<button onClick={() => statusMutation.mutate()}>Update Status</button>
<h3>Assign Courier</h3>
<select
value={courierId}
onChange={(e) => setCourierId(e.target.value)}
>
<option value="">Select Courier</option>
{staff?.data
?.filter((s: any) => s.role === "courier")
.map((c: any) => (
<option key={c.id} value={c.id}>
{c.name}
</option>
))}
</select>
<button onClick={() => assignMutation.mutate()}>Assign</button>
<h3>Timeline</h3>
<ul>
{order.timeline?.map((t: any, idx: number) => (
<li key={idx}>
{t.status} — {new Date(t.timestamp).toLocaleString()}
</li>
))}
</ul>
</div>
)
}