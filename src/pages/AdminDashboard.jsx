import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

// Child Components
import AddProduct from "./AddProduct";
import Orders from "./Orders";
import UpdateProduct from "./UpdateProduct";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  // --- 1. State & Caching (Optimistic UI) ---
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_cached_products") || "[]"); } 
    catch { return []; }
  });

  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_cached_orders") || "[]"); } 
    catch { return []; }
  });

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  
  // Add/Edit State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", description: "", priority: "1", quantity: "0", image: null, image2: null
  });

  const API_BASE = useMemo(
    () => process.env.REACT_APP_API_URL || "https://elvora-backend-l2g3.onrender.com",
    []
  );

  // Approved Orders Management
  const [approvedSelected, setApprovedSelected] = useState(() => new Set());
  const [clearedApprovedIds, setClearedApprovedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("clearedApprovedIds") || "[]"); } 
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("clearedApprovedIds", JSON.stringify(clearedApprovedIds));
  }, [clearedApprovedIds]);

  // --- 2. Auth Helpers ---
  const isUserAdmin = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return false;
    try {
      const parsed = JSON.parse(userData);
      return parsed.role === "admin" || parsed.isAdmin === true;
    } catch { return false; }
  };

  const ensureJWTToken = useCallback(async () => {
    const t = localStorage.getItem("adminToken");
    return t || null;
  }, []);

  // --- 3. Data Fetching ---
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const token = await ensureJWTToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];
        setOrders(safeData);
        localStorage.setItem("admin_cached_orders", JSON.stringify(safeData));
      }
    } catch (e) {
      console.error("Fetch orders error", e);
    } finally {
      setLoadingOrders(false);
    }
  }, [API_BASE, ensureJWTToken]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const token = await ensureJWTToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];
        setProducts(safeData);
        localStorage.setItem("admin_cached_products", JSON.stringify(safeData));
      }
    } catch (e) {
      console.error("Fetch products error", e);
    } finally {
      setLoadingProducts(false);
    }
  }, [API_BASE, ensureJWTToken]);

  // Initial Load
  useEffect(() => {
    if (!isUserAdmin()) {
      alert("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
    fetchOrders();
    if (products.length === 0) fetchProducts();
  }, [fetchOrders, fetchProducts, navigate]); // Removed products dependence

  // --- 4. Action Handlers (The Missing Functions) ---

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Token missing");

      const res = await fetch(`${API_BASE}/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      // Optimistic update
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem("admin_cached_products", JSON.stringify(updated));
      
      // Background sync
      fetchProducts();
    } catch (e) {
      setError("Failed to delete product");
    }
  };

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!newProduct.image) return setError("Please select an image file");

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Token missing");

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("description", newProduct.description);
      formData.append("priority", newProduct.priority || "1");
      formData.append("quantity", newProduct.quantity || "0");
      formData.append("image", newProduct.image);
      if (newProduct.image2) formData.append("image2", newProduct.image2);

      const res = await fetch(`${API_BASE}/admin/create-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Create failed");

      setShowAddForm(false);
      setNewProduct({ name: "", price: "", description: "", priority: "1", quantity: "0", image: null, image2: null });
      alert("Product added!");
      fetchProducts();
      setActiveTab("products");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdateProduct = useCallback(async (payload) => {
    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Token missing");

      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("price", String(payload.price));
      formData.append("description", payload.description);
      formData.append("priority", String(payload.priority ?? "1"));
      formData.append("quantity", String(payload.quantity ?? "0"));
      if (payload.imageFile) formData.append("image", payload.imageFile);
      if (payload.image2File) formData.append("image2", payload.image2File);

      const res = await fetch(`${API_BASE}/admin/update-product/${payload.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Product updated!");
      setSelectedProduct(null);
      fetchProducts();
      setActiveTab("products");
    } catch (e) {
      setError(e.message);
    }
  }, [API_BASE, ensureJWTToken, fetchProducts]);

  const approveOrder = useCallback(async (orderId) => {
    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Token missing");

      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));

      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Approve failed");
      
      fetchOrders(); // Sync
    } catch (e) {
      setError("Failed to approve order");
      fetchOrders(); // Revert on error
    }
  }, [API_BASE, ensureJWTToken, fetchOrders]);

  // --- 5. Filtering Helpers ---
  const pendingOrders = useMemo(() => orders.filter(o => String(o.status || "").toLowerCase() === "pending"), [orders]);
  
  const approvedOrders = useMemo(() => {
    const clearedSet = new Set(clearedApprovedIds);
    return orders.filter(o => {
      const isApproved = String(o.status || "").toLowerCase() !== "pending";
      return isApproved && !clearedSet.has(o.id);
    });
  }, [orders, clearedApprovedIds]);

  const toggleApprovedSelect = (id) => {
    setApprovedSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openUpdate = (product) => {
    setSelectedProduct(product);
    setActiveTab("updateProduct");
  };

  const handleImageError = (e) => {
    e.currentTarget.src = "https://placehold.co/300x200/EEE/31343C?text=No+Image";
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- 6. JSX Render ---
  return (
    <div className={styles.dashboardShell}>
      {/* Top Bar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Admin Panel</div>
          <div className={styles.brandSub}>Store Management</div>
        </div>
        <button onClick={logout} className={styles.logoutBtn}>Logout</button>
      </header>

      {error && (
        <div className={styles.errorAlert}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} className={styles.dismissBtn}>×</button>
        </div>
      )}

      <div className={styles.layout}>
        {/* Navigation Sidebar */}
        <nav className={styles.sidebar}>
          <div className={styles.navGroup}>
            <button 
              className={`${styles.navItem} ${activeTab === "orders" ? styles.active : ""}`} 
              onClick={() => setActiveTab("orders")}
            >
              <span className={styles.navIcon}>⚡</span>
              <span>Pending</span>
              {pendingOrders.length > 0 && <span className={styles.badge}>{pendingOrders.length}</span>}
            </button>

            <button 
              className={`${styles.navItem} ${activeTab === "approved" ? styles.active : ""}`} 
              onClick={() => setActiveTab("approved")}
            >
              <span className={styles.navIcon}>✓</span>
              <span>History</span>
            </button>

            <button 
              className={`${styles.navItem} ${activeTab === "products" ? styles.active : ""}`} 
              onClick={() => setActiveTab("products")}
            >
              <span className={styles.navIcon}>📦</span>
              <span>Products</span>
              <span className={styles.count}>{products.length}</span>
            </button>

            <button 
              className={`${styles.navItem} ${activeTab === "addProduct" ? styles.active : ""}`} 
              onClick={() => setActiveTab("addProduct")}
            >
              <span className={styles.navIcon}>+</span>
              <span>Add New</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className={styles.main}>
          <div className={styles.contentHeader}>
            <h2 className={styles.pageTitle}>
              {activeTab === "orders" && "Pending Orders"}
              {activeTab === "approved" && "Order History"}
              {activeTab === "products" && "Product Inventory"}
              {activeTab === "addProduct" && "Add New Product"}
              {activeTab === "updateProduct" && "Edit Product"}
            </h2>
            
            {activeTab === "approved" && (
               <div className={styles.headerActions}>
                  <button 
                    onClick={() => {
                        const ids = Array.from(approvedSelected);
                        setClearedApprovedIds(prev => [...new Set([...prev, ...ids])]);
                        setApprovedSelected(new Set());
                    }} 
                    disabled={approvedSelected.size === 0} 
                    className={styles.secondaryBtn}
                  >
                    Archive Selected
                  </button>
                  <button 
                    onClick={() => {
                        setClearedApprovedIds([]);
                        setApprovedSelected(new Set());
                    }} 
                    className={styles.textBtn}
                  >
                    Restore All
                  </button>
               </div>
            )}
          </div>

          <div className={styles.contentBody}>
            {activeTab === "orders" && (
              <Orders orders={pendingOrders} onApprove={approveOrder} mode="pending" />
            )}

            {activeTab === "approved" && (
              <Orders orders={approvedOrders} mode="approved" selectedIds={approvedSelected} onToggleSelect={toggleApprovedSelect} />
            )}

            {activeTab === "products" && (
               <div className={styles.productsGrid}>
                 {products.map((p) => (
                   <div key={p.id} className={styles.productCard}>
                     <div className={styles.cardImgFrame}>
                        <img 
                          src={p.image_url?.startsWith("http") ? p.image_url : `${API_BASE}${p.image_url}`} 
                          onError={handleImageError} 
                          alt={p.name} 
                        />
                     </div>
                     <div className={styles.cardBody}>
                        <div className={styles.cardHeader}>
                           <h3 title={p.name}>{p.name}</h3>
                           <span className={styles.priceTag}>₹{parseFloat(p.price).toFixed(0)}</span>
                        </div>
                        <p className={styles.cardDesc}>{p.description?.substring(0, 50)}...</p>
                        <div className={styles.cardFooter}>
                           <span className={styles.stockLabel}>Qty: {p.quantity}</span>
                           <div className={styles.cardActions}>
                             <button onClick={() => openUpdate(p)} className={styles.iconBtn} title="Edit">✎</button>
                             <button onClick={() => handleDelete(p.id)} className={`${styles.iconBtn} ${styles.danger}`} title="Delete">🗑</button>
                           </div>
                        </div>
                     </div>
                   </div>
                 ))}
                 {products.length === 0 && !loadingProducts && (
                    <div className={styles.emptyState}>No products found.</div>
                 )}
               </div>
            )}

            {activeTab === "addProduct" && (
               <div className={styles.formContainer}>
                 <AddProduct
                   showAddForm={true} 
                   setShowAddForm={setShowAddForm}
                   newProduct={newProduct}
                   setNewProduct={setNewProduct}
                   handleAddProduct={handleAddProduct}
                   setError={setError}
                 />
               </div>
            )}

            {activeTab === "updateProduct" && selectedProduct && (
               <div className={styles.formContainer}>
                 <UpdateProduct
                   product={selectedProduct}
                   apiBase={API_BASE}
                   onCancel={() => setActiveTab("products")}
                   onSubmit={handleUpdateProduct}
                   setError={setError}
                 />
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;