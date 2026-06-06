import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import { theme } from "@/theme";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total());

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: isOpen ? 0 : "-400px",
        width: 350,
        height: "100vh",
        background: theme.colors.surface,
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        padding: theme.spacing(3),
        transition: "right 0.3s ease",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2>Your Cart</h2>

      <div style={{ flex: 1, overflowY: "auto", marginTop: 20 }}>
        {items.length === 0 && <p>Your cart is empty.</p>}

        {items.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: "1px solid #ddd",
            }}
          >
            <h3>{item.name}</h3>
            <p>€{item.price.toFixed(2)}</p>
            <p>Qty: {item.quantity}</p>

            <Button
              variant="danger"
              onClick={() => removeItem(item.id)}
              style={{ marginTop: 10 }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <h3>Total: €{total.toFixed(2)}</h3>

        <Button
          onClick={() => {
            onClose();
            window.location.href = "/checkout";
          }}
          style={{ width: "100%", marginTop: 10 }}
        >
          Go to Checkout
        </Button>

        <Button
          variant="secondary"
          onClick={onClose}
          style={{ width: "100%", marginTop: 10 }}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
