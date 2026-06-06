import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin pages
import OpeningHoursPage from "./admin/pages/OpeningHoursPage.js";
import DeliveryZonesPage from "./admin/pages/DeliveryZonesPage.js";
import AdminOrdersPage from "./admin/pages/AdminOrdersPage.js";
import AdminMenuPage from "./admin/pages/AdminMenuPage.js"; // make sure this file exists

// Customer pages
import MenuPage from "./pages/MenuPage.js";
import CheckoutPage from "./pages/CheckoutPage.js";
import OrderTrackingPage from "./pages/OrderTrackingPage.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/track/:orderId" element={<OrderTrackingPage />} />

        {/* Admin Routes */}
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/opening-hours" element={<OpeningHoursPage />} />
        <Route path="/admin/delivery-zones" element={<DeliveryZonesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
