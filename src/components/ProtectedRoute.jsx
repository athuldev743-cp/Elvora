// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem("userToken");
  const userData = localStorage.getItem("userData");
  
  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }
  
  try {
    const user = JSON.parse(userData);
    
    if (requireAdmin && user.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    
    return children;
  } catch {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;