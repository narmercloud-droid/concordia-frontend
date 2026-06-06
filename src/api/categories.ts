import api from "./client.js"

export const getCategories = () => api.get("/admin/categories")
export const createCategory = (data: any) => api.post("/admin/categories", data)
export const deleteCategory = (id: string) =>
  api.delete(`/admin/categories/${id}`)
export const reorderCategories = (data: any) =>
  api.put("/admin/categories/reorder", data)
