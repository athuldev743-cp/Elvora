import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails.jsx";
import Account from "./pages/Account";
import BlogPost from "./pages/BlogPost"; 
import AllBlogs from "./pages/AllBlogs"; // ✅ 1. Import new page
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        
        {/* ✅ 2. Route for Single Article */}
        <Route path="/blog/:id" element={<BlogPost />} />

        {/* ✅ 3. Route for All Articles Page */}
        <Route path="/blog/all" element={<AllBlogs />} />
        
        <Route path="/account" element={<Account />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;