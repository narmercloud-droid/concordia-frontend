import React from "react"
import CustomerLayout from "./layouts/CustomerLayout.js"
import HomePage from "./pages/HomePage.js"

export const homeRoutes = {
  element: <CustomerLayout />,
  children: [{ index: true, element: <HomePage /> }]
}

export default homeRoutes
