import api from "./client.js"

export const getCategories = () => api.get("/menu/categories")
export const getItemsByCategory = (categoryId: string) =>
  api.get(`/menu/category/${categoryId}`)
export const getItem = (itemId: string) => api.get(`/menu/item/${itemId}`)
