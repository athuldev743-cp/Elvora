// src/pages/ProductDetails.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/publicAPI";
import BuyModal from "../components/Buy";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [showBuy, setShowBuy] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!user) {
      alert("Please login to place an order!");
      navigate("/");
      return;
    }
    setShowBuy(true);
  };

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  };

  const saveCart = (next) => {
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
  };

  const addToCart = () => {
    if (!product) return;

    const cart = getCart();
    const existing = cart.find((x) => String(x.id) === String(product.id));

    let next;
    if (existing) {
      next = cart.map((x) =>
        String(x.id) === String(product.id)
          ? { ...x, qty: Number(x.qty || 1) + quantity }
          : x
      );
    } else {
      next = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: quantity,
        },
      ];
    }

    saveCart(next);
    alert("✅ Added to cart!");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/1600x900/EEE/31343C?text=Product+Image";
  };

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price || 0) * quantity;
  }, [product, quantity]);

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-state">
          <div className="pd-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-state">
          <h2>⚠️ Product Not Found</h2>
          <button onClick={() => navigate("/")} className="pd-btn">
            Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ HERO LOGIC (FINAL)
  const isHeroProduct =
    Number(product.priority) === 1 && product.image2_url;

  return (
    <div className="pd-page">
      {/* FULL WIDTH HERO BANNER */}
      {isHeroProduct && (
        <div className="pd-fullHero">
          <img
            src={product.image2_url}
            alt={product.name}
            className="pd-fullHeroImg"
            onError={handleImageError}
          />
          <div className="pd-heroOverlay">
            <h1>{product.name}</h1>
            <p>Premium quality • Authentic • Trusted</p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CARD */}
      <div className="pd-card">
        <div className="pd-grid">
          {/* Normal Image only for non-priority products */}
          {!isHeroProduct && (
            <div className="pd-imageWrap">
              <img
                src={product.image_url}
                alt={product.name}
                className="pd-image"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="pd-content">
            {!isHeroProduct && (
              <div className="pd-titleRow">
                <h2>{product.name}</h2>
                <div className="pd-price">₹{product.price}</div>
              </div>
            )}

            <p className="pd-desc">{product.description}</p>

            <div className="pd-qtyRow">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <div className="pd-summary">
              <div>
                <span>Total</span>
                <b>₹{totalPrice.toFixed(2)}</b>
              </div>
            </div>

            <div className="pd-actions">
              <button className="pd-btn-secondary" onClick={addToCart}>
                Add to Cart
              </button>
              <button
                className="pd-btn-primary"
                onClick={handleBuyNow}
                disabled={!user}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <BuyModal
        open={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        quantity={quantity}
        user={user}
      />
    </div>
  );
};

export default ProductDetails;