import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails.jsx";
import Account from "./pages/Account";
import BlogPost from "./pages/BlogPost";
import AllBlogs from "./pages/AllBlogs";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Policy Pages
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Main Routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* ── Blog Routes ── */}
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/blog/all" element={<AllBlogs />} />

        {/* ── Account & Auth ── */}
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />

        {/* ── Admin ── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Policy Pages ── */}
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/refund-policy"         element={<RefundPolicy />} />
        <Route path="/shipping-policy"       element={<ShippingPolicy />} />
        <Route path="/contact"               element={<ContactPage />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;