import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const clearCart = useCartStore((s) => s.clearCart);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const submitOrder = async () => {
    const res = await axios.post("http://localhost:4000/api/v1/order", {
      customer_name: name,
      phone,
      address: deliveryType === "delivery" ? address : null,
      deliveryType,
      paymentMethod,
      items: items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
      })),
    });

    const orderId = res.data.order_id;

    clearCart();
    navigate(`/track/${orderId}`);
  };

  return (
    <Layout>
      <h1>Checkout</h1>

      <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
        {/* LEFT SIDE — FORM */}
        <div style={{ flex: 1 }}>
          <h2>Your Details</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div>
              <label>
                <input
                  type="radio"
                  checked={deliveryType === "delivery"}
                  onChange={() => setDeliveryType("delivery")}
                />
                Delivery
              </label>

              <label style={{ marginLeft: 20 }}>
                <input
                  type="radio"
                  checked={deliveryType === "pickup"}
                  onChange={() => setDeliveryType("pickup")}
                />
                Pickup
              </label>
            </div>

            {deliveryType === "delivery" && (
              <input
                placeholder="Delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            )}

            <div>
              <label>
                <input
                  type="radio"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                Cash
              </label>

              <label style={{ marginLeft: 20 }}>
                <input
                  type="radio"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                Card
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — SUMMARY */}
        <div style={{ width: 300 }}>
          <h2>Order Summary</h2>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <h3 style={{ marginTop: 20 }}>Total: €{total.toFixed(2)}</h3>

          <Button
            onClick={submitOrder}
            style={{ width: "100%", marginTop: 20 }}
          >
            Place Order
          </Button>
        </div>
      </div>
    </Layout>
  );
}
