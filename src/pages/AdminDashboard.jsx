// AdminDashboard.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

import AddProduct from "./AddProduct";
import Orders from "./Orders"; // we'll upgrade this component below

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders"); // orders | approved | products | addProduct
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    priority: "1",
    image: null,
  });

  const API_BASE = useMemo(
    () => process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com",
    []
  );

  const isUserAdmin = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return false;
    try {
      const parsed = JSON.parse(userData);
      return parsed.role === "admin" || parsed.isAdmin === true;
    } catch {
      return false;
    }
  };

  const ensureJWTToken = useCallback(async () => {
    const t = localStorage.getItem("adminToken");
    return t || null;
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Orders failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => []);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [API_BASE, ensureJWTToken]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Products failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => []);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [API_BASE, ensureJWTToken]);

  useEffect(() => {
    if (!isUserAdmin()) {
      alert("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoading(false);
      setError("Admin token missing. Please login again as admin.");
      navigate("/");
      return;
    }

    const boot = async () => {
      setLoading(true);
      setError("");
      await fetchOrders();
      setLoading(false);
    };

    boot();
  }, [fetchOrders, navigate]);

  // on-demand products
  useEffect(() => {
    if ((activeTab === "products" || activeTab === "addProduct") && products.length === 0 && !loadingProducts) {
      fetchProducts();
    }
  }, [activeTab, fetchProducts, products.length, loadingProducts]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleImageError = (e) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = "https://placehold.co/200x150/EEE/31343C?text=No+Image";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product deleted successfully!");
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.image) return setError("Please select an image file");
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      return setError("Please fill all required fields");
    }

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("priority", newProduct.priority || "1");
      formData.append("image", newProduct.image);

      const res = await fetch(`${API_BASE}/admin/create-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${text}`);
      }

      setShowAddForm(false);
      setNewProduct({ name: "", price: "", description: "", priority: "1", image: null });

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product added successfully!");
      setError("");
      setActiveTab("products");
    } catch (e) {
      setError(e?.message || "Failed to add product");
    }
  };

  const approveOrder = useCallback(
    async (orderId) => {
      try {
        const token = await ensureJWTToken();
        if (!token) throw new Error("Admin token missing. Please login again as admin.");

        const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Approve failed: ${res.status} ${text}`);
        }

        await fetchOrders(); // refresh: order moves to approved automatically
        alert("✅ Order approved and email sent!");
      } catch (e) {
        const msg = e?.message || "Failed to approve order";
        setError(msg);
        alert(msg);
      }
    },
    [API_BASE, ensureJWTToken, fetchOrders]
  );

  const pendingOrders = useMemo(
    () => orders.filter((o) => String(o.status || "").toLowerCase() === "pending"),
    [orders]
  );

  const approvedOrders = useMemo(
    () => orders.filter((o) => String(o.status || "").toLowerCase() !== "pending"),
    [orders]
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardShell}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Admin</div>
          <div className={styles.brandSub}>Orders • Products</div>
        </div>

        <button className={styles.logoutBtn} onClick={logout} type="button">
          Logout
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          ⚠️ {error}
          <button onClick={() => setError("")} className={styles.dismissBtn} type="button">
            ×
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {/* Main */}
        <main className={styles.main}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {activeTab === "orders" ? "Pending Orders" :
               activeTab === "approved" ? "Approved Orders" :
               activeTab === "products" ? "Products" : "Add Product"}
            </h2>

            <div className={styles.sectionMeta}>
              {activeTab === "orders" && <span className={styles.pill}>{pendingOrders.length} pending</span>}
              {activeTab === "approved" && <span className={styles.pill}>{approvedOrders.length} approved</span>}
              {activeTab === "products" && <span className={styles.pill}>{products.length} items</span>}
            </div>
          </div>

          {/* Orders */}
          {activeTab === "orders" && (
            <div className={styles.card}>
              {loadingOrders ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>⏳</div>
                  <h3>Loading Orders...</h3>
                  <p>Please wait</p>
                </div>
              ) : (
                <Orders orders={pendingOrders} onApprove={approveOrder} mode="pending" />
              )}
            </div>
          )}

          {/* Approved */}
          {activeTab === "approved" && (
            <div className={styles.card}>
              {loadingOrders ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>⏳</div>
                  <h3>Loading Orders...</h3>
                  <p>Please wait</p>
                </div>
              ) : (
                <Orders orders={approvedOrders} onApprove={approveOrder} mode="approved" />
              )}
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className={styles.card}>
              {loadingProducts ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>⏳</div>
                  <h3>Loading Products...</h3>
                  <p>Please wait</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📦</div>
                  <h3>No Products Found</h3>
                  <p>Add your first product using “Add Product”.</p>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {products.map((p) => (
                    <div key={p.id} className={styles.productCard}>
                      <div className={styles.productImage}>
                        {p.image_url ? (
                          <img
                            src={p.image_url.startsWith("http") ? p.image_url : `${API_BASE}${p.image_url}`}
                            alt={p.name}
                            onError={handleImageError}
                          />
                        ) : (
                          <div className={styles.noImage}>No Image</div>
                        )}
                      </div>

                      <div className={styles.productContent}>
                        <h3 className={styles.productTitle}>{p.name}</h3>
                        <div className={styles.productPrice}>₹{parseFloat(p.price).toFixed(2)}</div>
                        <p className={styles.productDescription}>{p.description}</p>

                        <div className={styles.productActions}>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} type="button">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Product */}
          {activeTab === "addProduct" && (
            <div className={styles.card}>
              <button
                className={styles.addProductBtn}
                onClick={() => setShowAddForm((s) => !s)}
                type="button"
              >
                {showAddForm ? "Close Form" : "Add New Product"}
              </button>

              <AddProduct
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                handleAddProduct={handleAddProduct}
                setError={setError}
              />
            </div>
          )}
        </main>

        {/* Right tabs */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>Navigation</div>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "orders" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Pending Orders
              <span className={styles.sideCount}>{pendingOrders.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "approved" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              Approved Orders
              <span className={styles.sideCount}>{approvedOrders.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "products" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("products")}
            >
              Products
              <span className={styles.sideCount}>{products.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "addProduct" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("addProduct")}
            >
              Add Product
            </button>
          </div>

          <div className={styles.sideHint}>
            Tip: Click an order card to expand. Approve inside the expanded panel.
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminDashboard;
