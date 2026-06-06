import { useState } from "react";
import Button from "@/components/ui/Button";
import axios from "axios";

export default function MenuForm({
  item,
  onSaved,
}: {
  item: any;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price || 0);
  const [category, setCategory] = useState(item?.category || "");
  const [image, setImage] = useState<File | null>(null);

  const save = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    formData.append("category", category);

    if (image) {
      formData.append("image", image);
    }

    if (item) {
      await axios.put(
        `http://localhost:4000/api/v1/menu/${item.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } else {
      await axios.post(
        "http://localhost:4000/api/v1/menu",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    }

    onSaved();
  };

  return (
    <div>
      <h2>{item ? "Edit Item" : "Add New Item"}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          placeholder="Price"
        />

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <Button onClick={save}>
          {item ? "Save Changes" : "Add Item"}
        </Button>
      </div>
    </div>
  );
}
