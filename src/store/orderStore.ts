import { create } from "zustand";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export type OrderStatus =
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

export interface Order {
  order_id: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;

  loadOrders: () => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setSelectedOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,

  loadOrders: async () => {
    const res = await axios.get("http://localhost:4000/api/v1/order/active");
    set({ orders: res.data });
  },

  updateStatus: async (orderId, status) => {
    await axios.put(
      `http://localhost:4000/api/v1/order/${orderId}/status`,
      { status }
    );
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),
}));

// SOCKET EVENTS
socket.on("order_created", (order: Order) => {
  useOrderStore.setState((state) => ({
    orders: [...state.orders, order],
  }));
});

socket.on("order_updated", (updatedOrder: Order) => {
  useOrderStore.setState((state) => ({
    orders: state.orders.map((o) =>
      o.order_id === updatedOrder.order_id ? updatedOrder : o
    ),
  }));
});
