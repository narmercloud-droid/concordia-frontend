import { useEffect, useState } from "react";
import AdminLayout from "@/admin/layout/AdminLayout";
import axios from "axios";
import api from "@/api/client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import MenuForm from "./MenuForm.js";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url?: string; // optional image field
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const loadItems = async () => {
    const res = await api.get("/api/v1");
    setItems(res.data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <AdminLayout>
      <h1>Menu Management</h1>

      <Button onClick={openAddModal}>Add New Item</Button>

      <div style={{ marginTop: 20, display: "grid", gap: 20 }}>
        {items.map((item) => (
          <Card key={item.id}>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 10,
                  objectFit: "cover",
                }}
              />
            )}

            <h3>{item.name}</h3>
            <p>Category: {item.category}</p>
            <p>Price: €{item.price.toFixed(2)}</p>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => openEditModal(item)}>
                Edit
              </Button>

              <Button
                variant="danger"
                onClick={async () => {
                  await axios.delete(
                    `http://localhost:4000/api/v1/menu/${item.id}`
                  );
                  loadItems();
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal onClose={closeModal}>
          <MenuForm
            item={editingItem}
            onSaved={() => {
              closeModal();
              loadItems();
            }}
          />
        </Modal>
      )}
    </AdminLayout>
  );
}
