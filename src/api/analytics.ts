import api from "./client.js"

export const getSalesAnalytics = () => api.get("/api/admin/analytics/sales")
export const getOrderVolumeAnalytics = () =>
  api.get("/api/admin/analytics/order-volume")
export const getCategoryPerformance = () =>
  api.get("/api/admin/analytics/category-performance")
export const getBranchPerformance = () =>
  api.get("/api/admin/analytics/branch-performance")
export const getPeakHours = () => api.get("/api/admin/analytics/peak-hours")
export const getTopItems = () => api.get("/api/admin/analytics/top-items")
