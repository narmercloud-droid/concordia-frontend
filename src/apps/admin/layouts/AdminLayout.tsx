import React from "react"
import AdminNav from "../components/AdminNav.js"
import AdminBranchBar from "../components/AdminBranchBar.js"
import AdminBranchOutlet from "../components/AdminBranchOutlet.js"
import { useSiteDocumentTitle } from "@/hooks/useSiteDocumentTitle"

export default function AdminLayout() {
  useSiteDocumentTitle("Admin")
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          background: "#222",
          color: "white",
          padding: 20
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Admin Panel</h2>
        <AdminNav />
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <AdminBranchBar />
        <AdminBranchOutlet />
      </main>
    </div>
  )
}
