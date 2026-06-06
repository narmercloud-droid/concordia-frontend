import api from "./client.js"

export const getItems = () => api.get("/admin/items")
export const createItem = (data: any) => api.post("/admin/items", data)
export const deleteItem = (id: string) =>
  api.delete(`/admin/items/${id}`)
export const reorderItems = (data: any) =>
  api.put("/admin/items/reorder", data)

export const toggleItemAvailability = (id: string) =>
  api.put(`/admin/items/${id}/toggle-availability`)
