import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
const notificationSound = new Audio("/sounds/new-order.mp3");


type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

interface OrderItem {
  id: number;
  quantity: number;
  item: {
    customer_name_de: string;
  };
}

interface Order {
  order_id: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    const res = await axios.get("http://localhost:4000/api/v1/order/active");
    setOrders(res.data);
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await axios.put(`http://localhost:4000/api/v1/order/${orderId}/status`, {
      status,
    });
  };

  useEffect(() => {
    loadOrders();

    socket.on("order_created", (order: Order) => {
      setOrders((prev) => [...prev, order]);
    });

    socket.on("order_updated", (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.order_id === updatedOrder.order_id ? updatedOrder : o))
      );
    });

    return () => {
      socket.off("order_created");
      socket.off("order_updated");
    };
  }, []);

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    accepted: "Accepted",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Orders</h1>

      {/* FILTERS */}
      <div style={{ marginBottom: 20 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{ padding: 10, fontSize: 16 }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ORDER LIST */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {filteredOrders.map((order) => (
          <div
            key={order.order_id}
            style={{
              border: "1px solid #ccc",
              padding: 20,
              width: 300,
              borderRadius: 10,
              cursor: "pointer",
            }}
            onClick={() => setSelectedOrder(order)}
          >
            <h3>Order #{order.order_id}</h3>
            <p>Status: <strong>{statusLabels[order.status]}</strong></p>
            <p>Items: {order.items.length}</p>
            <p>{new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              width: 400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Order #{selectedOrder.order_id}</h2>
            <p>Status: {statusLabels[selectedOrder.status]}</p>

            <h3>Items</h3>
            <ul>
              {selectedOrder.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}× {item.item.customer_name_de}
                </li>
              ))}
            </ul>

            <h3>Update Status</h3>
            {(["pending", "accepted", "preparing", "ready", "completed"] as OrderStatus[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selectedOrder.order_id, s)}
                  style={{
                    marginRight: 10,
                    marginTop: 10,
                    padding: "8px 12px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  {statusLabels[s]}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
