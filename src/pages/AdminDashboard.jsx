import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getOrders
} from "../api/adminAPI";
import "./Dashboard.module.css"
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      setError("Failed to fetch products: " + (err.detail || err.message));
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(token);
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders: " + (err.detail || err.message));
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchProducts(), fetchOrders()]);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts, fetchOrders, token, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete product?")) {
      try {
        await deleteProduct(id, token);
        fetchProducts();
      } catch (err) {
        setError("Failed to delete product");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>

      {error && <div style={{ color: "red", margin: "20px 0" }}>{error}</div>}

      <h2>Products ({products.length})</h2>
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id} style={{ marginBottom: "10px" }}>
              <strong>{p.name}</strong> – ₹{p.price}
              <button 
                onClick={() => handleDelete(p.id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id} style={{ marginBottom: "10px" }}>
              {o.customer_email} | {o.status} | ₹{o.total}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminDashboard;