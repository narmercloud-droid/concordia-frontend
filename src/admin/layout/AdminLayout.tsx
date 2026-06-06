import React from "react";
import { theme } from "@/theme";
import { Link } from "react-router-dom";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: theme.colors.primary,
          color: "white",
          padding: theme.spacing(2),
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        }}
      >
        <h2 style={{ margin: 0 }}>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link style={linkStyle} to="/admin/orders">Orders</Link>
          <Link style={linkStyle} to="/admin/menu">Menu</Link>
          <Link style={linkStyle} to="/admin/opening-hours">Opening Hours</Link>
          <Link style={linkStyle} to="/admin/delivery-zones">Delivery Zones</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: theme.spacing(3),
          background: theme.colors.surface,
        }}
      >
        {children}
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: 18,
  fontWeight: 500,
};
