import api from "./client.js"

export const getSalesAnalytics = () => api.get("/admin/analytics/sales")
export const getOrderVolumeAnalytics = () =>
  api.get("/admin/analytics/order-volume")
export const getCategoryPerformance = () =>
  api.get("/admin/analytics/category-performance")
export const getBranchPerformance = () =>
  api.get("/admin/analytics/branch-performance")
export const getPeakHours = () => api.get("/admin/analytics/peak-hours")
export const getTopItems = () => api.get("/admin/analytics/top-items")
