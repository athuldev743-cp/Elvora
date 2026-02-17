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

  // user
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // product
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product details. Please try again.");
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

  // cart helpers
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
          ? { ...x, qty: Number(x.qty || 1) + Number(quantity || 1) }
          : x
      );
    } else {
      next = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: Number(quantity || 1),
        },
      ];
    }

    saveCart(next);
    alert("✅ Added to cart!");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/1200x900/EEE/31343C?text=Product+Image";
  };

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price || 0) * Number(quantity || 1);
  }, [product, quantity]);

  const decQty = () => setQuantity((prev) => Math.max(1, prev - 1));
  const incQty = () => setQuantity((prev) => prev + 1);

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
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ EXACT RULE:
  // Priority 1 + image2_url exists => show ONLY hero banner
  const isHeroProduct = Number(product.priority) === 1 && !!product.image2_url;
  const displayImageUrl = isHeroProduct ? product.image2_url : product.image_url;

  return (
    <div className="pd-page">
      {/* Header */}
      <div className="pd-header">
        <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
          ← Back to Products
        </button>
        <h1 className="pd-title">Product Details</h1>
      </div>

      {/* Mamaearth-like main layout */}
      <div className="pd-shell">
        {/* LEFT: Image */}
        <div className="pd-left">
          <div className={`pd-media ${isHeroProduct ? "pd-media-hero" : ""}`}>
            <img
              src={displayImageUrl}
              alt={product.name}
              className={`pd-image ${isHeroProduct ? "pd-image-heroOnly" : ""}`}
              onError={handleImageError}
              loading="lazy"
            />
          </div>

          <div className="pd-badges">
            <span className="pd-badge">Authentic</span>
            <span className="pd-badge">Fast Delivery</span>
            <span className="pd-badge">Secure Checkout</span>
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="pd-right">
          <div className="pd-top">
            <div className="pd-nameWrap">
              <h2 className="pd-name">{product.name}</h2>
              <p className="pd-sub">Premium quality • Authentic feel • Fast delivery</p>
            </div>

            <div className="pd-priceWrap">
              <div className="pd-price">₹{product.price}</div>
              <div className="pd-taxNote">Inclusive of all taxes</div>
            </div>
          </div>

          {/* Quantity */}
          <div className="pd-rowCard">
            <div className="pd-rowCardTitle">Quantity</div>
            <div className="pd-qtyRow">
              <button className="pd-qtyBtn" onClick={decQty} disabled={quantity <= 1} aria-label="Decrease">
                −
              </button>
              <span className="pd-qty">{quantity}</span>
              <button className="pd-qtyBtn" onClick={incQty} aria-label="Increase">
                +
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pd-rowCard">
            <div className="pd-rowCardTitle">Description</div>
            <p className="pd-desc">{product.description || "No description available."}</p>
          </div>

          {/* Summary */}
          <div className="pd-summary">
            <div className="pd-srow">
              <span>Price (each)</span>
              <span>₹{Number(product.price || 0).toFixed(2)}</span>
            </div>
            <div className="pd-srow">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            <div className="pd-srow pd-total">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Desktop sticky CTA (Mamaearth-like side card) */}
          <div className="pd-stickyActions">
            <div className="pd-ctaRow">
              <button className="pd-btn pd-btn-soft pd-cta" onClick={addToCart}>
                Add to Cart
              </button>

              <button
                className="pd-btn pd-btn-primary pd-cta"
                onClick={handleBuyNow}
                disabled={!user}
                title={!user ? "Login required" : "Buy now"}
              >
                Buy Now
              </button>
            </div>

            {!user ? (
              <div className="pd-loginHint">
                Login required to checkout.
                <button className="pd-linkBtn" onClick={() => navigate("/")}>
                  Login
                </button>
              </div>
            ) : (
              <button className="pd-btn pd-btn-outline pd-viewCart" onClick={() => navigate("/account")}>
                View Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Mobile sticky bottom bar */}
      <div className="pd-bottomBar">
        <div className="pd-bottomInfo">
          <div className="pd-bottomTotal">
            <span className="pd-bottomLabel">Total</span>
            <b>₹{totalPrice.toFixed(2)}</b>
          </div>

          <div className="pd-bottomQty">
            <button className="pd-miniQtyBtn" onClick={decQty} disabled={quantity <= 1} aria-label="Decrease quantity">
              −
            </button>
            <span className="pd-miniQty">{quantity}</span>
            <button className="pd-miniQtyBtn" onClick={incQty} aria-label="Increase quantity">
              +
            </button>
          </div>
        </div>

        <div className="pd-bottomBtns">
          <button className="pd-btn pd-btn-soft pd-bottomBtn" onClick={addToCart}>
            Add to Cart
          </button>
          <button
            className="pd-btn pd-btn-primary pd-bottomBtn"
            onClick={handleBuyNow}
            disabled={!user}
            title={!user ? "Login required" : "Buy now"}
          >
            Buy Now
          </button>
        </div>

        {!user && <div className="pd-bottomHint">Login required to purchase</div>}
      </div>

      {/* Buy Modal */}
      <BuyModal
        open={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        quantity={quantity}
        user={user}
        onSuccess={() => {
          setShowBuy(false);
          navigate("/");
        }}
      />
    </div>
  );
};

export default ProductDetails;