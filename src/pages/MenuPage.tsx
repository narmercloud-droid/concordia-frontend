import { useEffect, useState } from "react";
import api from "@/api/client";

import Layout from "@/components/layout/Layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import { useCartStore } from "@/store/cartStore";
import { MenuItem } from "@/types/MenuItem";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const addToCart = useCartStore((s) => s.addItem);

  const loadMenu = async () => {
    const res = await api.get("/api/v1");
    setItems(res.data);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <Layout>
      <h1>Our Menu</h1>

      {categories.map((category) => (
        <section key={category} style={{ marginBottom: 40 }}>
          <h2>{category}</h2>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            }}
          >
            {items
              .filter((i) => i.category === category)
              .map((item) => (
                <Card key={item.id}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    />
                  )}

                  <h3>{item.name}</h3>
                  <p>€{item.price.toFixed(2)}</p>

                  <Button
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </Layout>
  );
}
