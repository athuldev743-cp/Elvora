// src/pages/Products.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";
import { fetchProducts } from "../api/publicAPI";

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // same auth behavior as Home: if user not logged, block view details
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) return;
    try {
      setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminToken");
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load products", e);
      setError("Temporary issue loading products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    // keep in sync when admin updates products
    const onStorage = (e) => {
      if (e.key === "productsUpdated") loadProducts();
    };
    window.addEventListener("storage", onStorage);

    const onFocus = () => loadProducts();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadProducts]);

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => safeNum(a.priority, 9999) - safeNum(b.priority, 9999));
  }, [products]);

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x450/EEE/31343C?text=Product+Image";
  };

  const goDetails = (p) => {
    // enforce available soon block
    const qty = safeNum(p.quantity, 0);
    const availableSoon = qty <= 0;
    if (availableSoon) return;

    // enforce login like Home
    if (!user) {
      alert("Please login to view details.");
      return;
    }
    navigate(`/products/${p.id}`);
  };

  return (
    <section className="productsPage">
      <div className="productsHeader">
        <h1 className="productsTitle">All Products</h1>
        <div className="productsMeta">
          <span className="productsCount">{sorted.length} items</span>
        </div>
      </div>

      {error && <div className="productsError">⚠️ {error}</div>}
      {loading && <div className="productsLoading">Loading products…</div>}

      {!loading && !error && sorted.length === 0 && (
        <div className="productsEmpty">
          <div className="productsEmptyIcon">📦</div>
          <h3>No products available</h3>
          <p>Please check back later.</p>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="productsGrid">
          {sorted.map((p) => {
            const qty = safeNum(p.quantity, 0);
            const availableSoon = qty <= 0;

            return (
              <div
                key={p.id}
                className={`pCard ${availableSoon ? "pCardSoon" : ""}`}
                role="group"
                aria-label={p.name}
              >
                {availableSoon && <div className="pBadge">Available Soon</div>}

                <div className="pImgWrap">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="pImg"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>

                <div className="pBody">
                  <div className="pName" title={p.name}>
                    {p.name}
                  </div>

                  {/* Optional: show quantity */}
                  <div className="pSub">
                    {availableSoon ? "Out of stock" : `In stock: ${qty}`}
                  </div>

                  <button
                    type="button"
                    className={`pBtn ${availableSoon ? "pBtnDisabled" : ""}`}
                    onClick={() => goDetails(p)}
                    disabled={availableSoon}
                    title={availableSoon ? "Available soon" : "View details"}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Products;
