import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const items = useCartStore((s) => s.items);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <h1>Concordia</h1>

        <button
          onClick={() => setCartOpen(true)}
          style={{
            position: "relative",
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          🛒
          {items.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -10,
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: 12,
              }}
            >
              {items.length}
            </span>
          )}
        </button>
      </header>

      <main style={{ padding: 20 }}>{children}</main>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
