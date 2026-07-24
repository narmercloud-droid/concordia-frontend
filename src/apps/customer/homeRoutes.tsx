import CustomerLayout from "./layouts/CustomerLayout.js"
import HomePage from "./pages/HomePage.js"

/** Homepage is eager so post-deploy chunk 404s cannot blank the landing page. */
export const homeRoutes = {
  element: <CustomerLayout />,
  children: [
    {
      index: true,
      element: <HomePage />
    }
  ]
}

export default homeRoutes
