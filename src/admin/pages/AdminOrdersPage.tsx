import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Layout from "@/components/layout/Layout";

const socket = io("http://localhost:4000");

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  // Load sound file
  const notificationSound = new Audio("/sounds/new-order.mp3");

  const loadOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/order/kitchen");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();

    // 🔥 Play sound ONLY when a new order arrives
    socket.on("order_created", (newOrder) => {
      notificationSound.play().catch(() => {});
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.off("order_created");
    };
  }, []);

  return (
    <Layout>
      <h1>Kitchen Orders</h1>

      {orders.map((order) => (
        <div
          key={order.order_id}
          style={{
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
            background: "#f5f5f5",
          }}
        >
          <p><strong>Order ID:</strong> {order.order_id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> €{order.total}</p>
        </div>
      ))}
    </Layout>
  );
}
