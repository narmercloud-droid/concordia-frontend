import React, { useState, useEffect } from "react";
import axios from "axios";

type OpeningHours = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

function OpeningHoursPage() {
  const [hours, setHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/admin/opening-hours")
      .then((res) => {
        const loaded = res.data.map((h: any) => ({
          ...h,
          closed: h.open === "Closed" || h.close === "Closed",
        }));
        setHours(loaded);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateHour = (
    index: number,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setHours((prev) =>
      prev.map((h, i) =>
        i === index
          ? {
              ...h,
              [field]: value,
              ...(field === "closed" && value === true
                ? { open: "Closed", close: "Closed" }
                : {}),
            }
          : h
      )
    );
  };

  const save = async () => {
    setSaving(true);

    const payload = hours.map((h) => ({
      day: h.day,
      open: h.closed ? "Closed" : h.open,
      close: h.closed ? "Closed" : h.close,
    }));

    try {
      await axios.post("http://localhost:4000/api/admin/opening-hours", payload);
      alert("Opening hours saved!");
    } catch (err) {
      alert("Error saving opening hours");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h1>Opening Hours</h1>

      {hours.map((h, i) => (
        <div
          key={i}
          style={{
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <strong>{h.day}</strong>

          <div style={{ marginTop: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={h.closed}
                onChange={(e) => updateHour(i, "closed", e.target.checked)}
              />{" "}
              Closed
            </label>
          </div>

          {!h.closed && (
            <>
              <div style={{ marginTop: "8px" }}>
                Open:{" "}
                <input
                  type="time"
                  value={h.open}
                  onChange={(e) => updateHour(i, "open", e.target.value)}
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                Close:{" "}
                <input
                  type="time"
                  value={h.close}
                  onChange={(e) => updateHour(i, "close", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      ))}

      <button onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default OpeningHoursPage;
