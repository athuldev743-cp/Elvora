// src/components/Buy.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Buy.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Props:
 * open: boolean
 * onClose: () => void
 * product: { id, name, price, ... }
 * quantity: number
 * user: { name, email }
 * onSuccess: () => void
 */
const BuyModal = ({ open, onClose, product, quantity, user, onSuccess }) => {
  const [orderLoading, setOrderLoading] = useState(false);

  const [orderForm, setOrderForm] = useState({
    fullName:    "",
    phoneNumber: "",
    email:       "",
    address:     "",
    city:        "",
    state:       "",
    pincode:     "",
    notes:       "",
  });

  // Persist shipping details per-user in localStorage
  const STORAGE_KEY = useMemo(() => {
    const emailKey = (user?.email || "").trim().toLowerCase();
    return emailKey ? `elvora_checkout_${emailKey}` : "elvora_checkout_guest";
  }, [user?.email]);

  // Total amount
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price || 0) * Number(quantity || 1);
  }, [product, quantity]);

  // Load saved details when modal opens
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setOrderForm((prev) => ({
          ...prev,
          ...saved,
          fullName: user?.name  || saved.fullName || prev.fullName || "",
          email:    user?.email || saved.email    || prev.email    || "",
        }));
        return;
      }
    } catch (e) {
      console.warn("Failed to read saved checkout details", e);
    }
    setOrderForm((prev) => ({
      ...prev,
      fullName: user?.name  || prev.fullName || "",
      email:    user?.email || prev.email    || "",
    }));
  }, [open, STORAGE_KEY, user]);

  // Save shipping details whenever form changes
  useEffect(() => {
    if (!open) return;
    const toSave = {
      fullName:    orderForm.fullName,
      phoneNumber: orderForm.phoneNumber,
      email:       orderForm.email,
      address:     orderForm.address,
      city:        orderForm.city,
      state:       orderForm.state,
      pincode:     orderForm.pincode,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("Failed to save checkout details", e);
    }
  }, [open, STORAGE_KEY, orderForm]);

  // Lock page scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !orderLoading) onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, orderLoading]);

  const safeClose = useCallback(() => {
    if (orderLoading) return;
    onClose?.();
  }, [orderLoading, onClose]);

  if (!open) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, phoneNumber, email, address, city, state, pincode } = orderForm;
    if (!fullName.trim())                                      { alert("Please enter your full name");                return false; }
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber)) { alert("Please enter a valid 10-digit phone number"); return false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))        { alert("Please enter a valid email address");         return false; }
    if (!address.trim())                                       { alert("Please enter your delivery address");         return false; }
    if (!city.trim())                                          { alert("Please enter your city");                     return false; }
    if (!state.trim())                                         { alert("Please enter your state");                    return false; }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode))          { alert("Please enter a valid 6-digit pincode");       return false; }
    return true;
  };

  // Pay Online: backend creates order + Instamojo link → redirect
  // After payment Instamojo calls backend callback → backend redirects to /account
  const handlePayAndSubmit = async () => {
    if (!product)        return;
    if (!validateForm()) return;

    setOrderLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/payment/create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id:       product.id,
          product_name:     product.name,
          quantity:         quantity,
          unit_price:       product.price,
          total_amount:     totalPrice,
          customer_name:    orderForm.fullName,
          customer_email:   orderForm.email,
          customer_phone:   orderForm.phoneNumber,
          shipping_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.state} - ${orderForm.pincode}`,
          notes:            orderForm.notes || "",
        }),
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Payment initiation failed. Please try again.");
        console.error("Instamojo error:", data);
        setOrderLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Network error. Please check your connection and try again.");
      setOrderLoading(false);
    }
  };

  return (
    <div className="buy-overlay" onMouseDown={safeClose}>
      <div className="buy-modal" onMouseDown={(e) => e.stopPropagation()}>

        <div className="buy-head">
          <div>
            <h2 className="buy-title">Complete Your Order</h2>
            <p className="buy-sub">Secure checkout • Fast confirmation</p>
          </div>
          <button
            className="buy-close"
            onClick={safeClose}
            disabled={orderLoading}
            aria-label="Close"
            type="button"
          >
            x
          </button>
        </div>

        <div className="buy-body">
          <div className="buy-summary">
            <h3>Order Summary</h3>
            <div className="buy-row">
              <span>Product</span>
              <span className="buy-strong">{product?.name}</span>
            </div>
            <div className="buy-row">
              <span>Price</span>
              <span>Rs.{product?.price} x {quantity}</span>
            </div>
            <div className="buy-row buy-total">
              <span>Total</span>
              <span>Rs.{Number(totalPrice).toFixed(2)}</span>
            </div>
          </div>

          <div className="buy-form">
            <h3>Shipping Details</h3>

            <div className="buy-grid2">
              <div className="buy-field">
                <label>Full Name *</label>
                <input name="fullName" value={orderForm.fullName} onChange={handleFormChange} placeholder="Enter your full name" />
              </div>
              <div className="buy-field">
                <label>Phone Number *</label>
                <input name="phoneNumber" value={orderForm.phoneNumber} onChange={handleFormChange} placeholder="10-digit mobile number" maxLength={10} inputMode="numeric" />
              </div>
            </div>

            <div className="buy-field">
              <label>Email Address *</label>
              <input name="email" type="email" value={orderForm.email} onChange={handleFormChange} placeholder="Enter your email" />
            </div>

            <div className="buy-field">
              <label>Delivery Address *</label>
              <textarea name="address" value={orderForm.address} onChange={handleFormChange} placeholder="Full address with landmark" rows={3} />
            </div>

            <div className="buy-grid3">
              <div className="buy-field">
                <label>City *</label>
                <input name="city" value={orderForm.city} onChange={handleFormChange} placeholder="City" />
              </div>
              <div className="buy-field">
                <label>State *</label>
                <input name="state" value={orderForm.state} onChange={handleFormChange} placeholder="State" />
              </div>
              <div className="buy-field">
                <label>Pincode *</label>
                <input name="pincode" value={orderForm.pincode} onChange={handleFormChange} placeholder="6-digit pincode" maxLength={6} inputMode="numeric" />
              </div>
            </div>

            <div className="buy-field">
              <textarea name="notes" value={orderForm.notes} onChange={handleFormChange} placeholder="Any special instructions (optional)" rows={2} />
            </div>
          </div>
        </div>

        <div className="buy-actions">
          <button className="buy-btn buy-outline" onClick={safeClose} disabled={orderLoading} type="button">
            Cancel
          </button>
          <button className="buy-btn buy-primary" onClick={handlePayAndSubmit} disabled={orderLoading} type="button">
            {orderLoading
              ? <><span className="buy-miniSpin" /> Redirecting...</>
              : `Pay Now Rs.${totalPrice.toFixed(2)}`
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default BuyModal;