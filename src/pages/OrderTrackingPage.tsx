import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import axios from "axios";
import { io } from "socket.io-client";
import OrderTimeline from "../components/OrderTimeline.js";

const socket = io("http://localhost:4000");

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);

  const loadOrder = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/v1/order/${orderId}`
      );
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order:", err);
    }
  };

  useEffect(() => {
    loadOrder();

    socket.on("order_updated", (updatedOrder) => {
      if (updatedOrder.order_id === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      socket.off("order_updated");
    };
  }, [orderId]);

  if (!order) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1 style={{ marginBottom: 10 }}>Order Tracking</h1>

      <p style={{ marginBottom: 20 }}>
        <strong>Order ID:</strong> {order.order_id}
      </p>

      {/* ETA DISPLAY */}
      {order.estimated_time && (
        <p style={{ fontSize: 18, marginBottom: 20 }}>
          Estimated time:{" "}
          <strong>{order.estimated_time} minutes</strong>
        </p>
      )}

      {/* TIMELINE */}
      <OrderTimeline status={order.status} />
    </Layout>
  );
}
