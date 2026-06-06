import api from "./client.js"
export const getAdminOrders = (branchId?: string) =>
api.get("/admin/orders", { params: { branchId } })
export const assignCourier = (orderId: string, courierId: string) =>
api.put(`/admin/orders/${orderId}/assign-courier`, { courierId })
export const updateOrderStatus = (orderId: string, status: string) =>
api.put(`/admin/orders/${orderId}/status`, { status })