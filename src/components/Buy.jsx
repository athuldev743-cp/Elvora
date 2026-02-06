// src/components/Buy.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Buy.css";
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from "../api/publicAPI";

/**
 * Props:
 * open: boolean
 * onClose: () => void
 * product: { id, name, price, ... }
 * quantity: number
 * user: { name, email }
 * onSuccess: () => void
 * useRazorpay?: boolean   (default true)
 */
const BuyModal = ({ open, onClose, product, quantity, user, onSuccess, useRazorpay = true }) => {
  const [orderLoading, setOrderLoading] = useState(false);

  const RZP_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price || 0) * Number(quantity || 1);
  }, [product, quantity]);

  // Prefill from logged user
  useEffect(() => {
    if (!open) return;
    setOrderForm((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || "",
      email: user?.email || prev.email || "",
    }));
  }, [open, user]);

  // Lock page scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close (disable during loading)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !orderLoading) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, orderLoading]);

  const safeClose = useCallback(() => {
    if (orderLoading) return; // prevent accidental close during payment/order
    onClose?.();
  }, [orderLoading, onClose]);

  if (!open) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, phoneNumber, email, address, city, state, pincode } = orderForm;

    if (!fullName.trim()) return alert("Please enter your full name"), false;

    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber))
      return alert("Please enter a valid 10-digit phone number"), false;

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      return alert("Please enter a valid email address"), false;

    if (!address.trim()) return alert("Please enter your delivery address"), false;
    if (!city.trim()) return alert("Please enter your city"), false;
    if (!state.trim()) return alert("Please enter your state"), false;

    if (!pincode.trim() || !/^\d{6}$/.test(pincode))
      return alert("Please enter a valid 6-digit pincode"), false;

    return true;
  };

  const openRazorpay = (rzpOrder) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) return reject(new Error("Razorpay SDK not loaded"));
      if (!RZP_KEY_ID) return reject(new Error("Razorpay key missing (REACT_APP_RAZORPAY_KEY_ID)"));

      const options = {
        key: RZP_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "Eka Bhumi",
        description: "Secure payment",
        order_id: rzpOrder.id,
        prefill: {
          name: orderForm.fullName || user?.name || "",
          email: orderForm.email || user?.email || "",
          contact: orderForm.phoneNumber || "",
        },
        theme: { color: "#F26722" },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });

  // ✅ Flow 1: Razorpay payment + then place order
  const handlePayAndSubmit = async () => {
    if (!product) return;
    if (!validateForm()) return;

    setOrderLoading(true);
    try {
      // 1) Create Razorpay order (backend)
     // 1) Create Razorpay order (backend)
const rzpOrder = await createRazorpayOrder(totalPrice);

// 2) Open Razorpay Checkout
const payRes = await openRazorpay(rzpOrder);

// 2.5) ✅ VERIFY PAYMENT SIGNATURE (backend)
await verifyRazorpayPayment(payRes);

// 3) Create your DB order
const orderData = {
  product_id: product.id,
  product_name: product.name,
  quantity,
  unit_price: product.price,
  total_amount: Number(product.price) * Number(quantity),
  customer_name: orderForm.fullName,
  customer_email: orderForm.email,
  customer_phone: orderForm.phoneNumber,
  shipping_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.state} - ${orderForm.pincode}`,
  notes: `${orderForm.notes || ""}\n[RZP] order=${payRes.razorpay_order_id} payment=${payRes.razorpay_payment_id}`.trim(),
  status: "pending",
  payment_status: "paid",
  razorpay_order_id: payRes.razorpay_order_id,
  razorpay_payment_id: payRes.razorpay_payment_id,
};

await createOrder(orderData);

      alert("✅ Payment successful! Order placed. You will receive an email after admin confirms.");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Payment/Order failed. Please try again.";
      alert(msg);
    } finally {
      setOrderLoading(false);
    }
  };

  // ✅ Flow 2: COD / normal pending order
  const handleSubmitPending = async () => {
    if (!product) return;
    if (!validateForm()) return;

    setOrderLoading(true);
    try {
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        total_amount: Number(product.price) * Number(quantity),
        customer_name: orderForm.fullName,
        customer_email: orderForm.email,
        customer_phone: orderForm.phoneNumber,
        shipping_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.state} - ${orderForm.pincode}`,
        notes: orderForm.notes,
        status: "pending",
        payment_status: "pending",
      };

      await createOrder(orderData);
      alert("✅ Order placed! You will receive an email once the admin confirms your order.");
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create order:", err);
      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Failed to place order. Please try again.";
      alert(msg);
    } finally {
      setOrderLoading(false);
    }
  };

  const primaryClick = useRazorpay ? handlePayAndSubmit : handleSubmitPending;
  const primaryLabel = useRazorpay ? `Pay & Place Order (₹${totalPrice.toFixed(2)})` : "✅ Confirm Order";

  return (
    <div className="buy-overlay" onMouseDown={safeClose}>
      <div className="buy-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="buy-head">
          <div>
            <h2 className="buy-title">Complete Your Order</h2>
            <p className="buy-sub">Premium checkout • Clean details • Fast confirmation</p>
          </div>

          <button
            className="buy-close"
            onClick={safeClose}
            disabled={orderLoading}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="buy-body">
          {/* Summary */}
          <div className="buy-summary">
            <h3>Order Summary</h3>
            <div className="buy-row">
              <span>Product</span>
              <span className="buy-strong">{product?.name}</span>
            </div>
            <div className="buy-row">
              <span>Price</span>
              <span>
                ₹{product?.price} × {quantity}
              </span>
            </div>
            <div className="buy-row buy-total">
              <span>Total</span>
              <span>₹{Number(totalPrice).toFixed(2)}</span>
            </div>

            {useRazorpay && !RZP_KEY_ID ? (
              <div className="buy-warn">
                ⚠️ Razorpay key missing. Add <b>REACT_APP_RAZORPAY_KEY_ID</b> in frontend .env
              </div>
            ) : null}
          </div>

          {/* Form */}
          <div className="buy-form">
            <h3>Shipping Details</h3>

            <div className="buy-grid2">
              <div className="buy-field">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={orderForm.fullName}
                  onChange={handleFormChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="buy-field">
                <label>Phone Number *</label>
                <input
                  name="phoneNumber"
                  value={orderForm.phoneNumber}
                  onChange={handleFormChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="buy-field">
              <label>Email Address *</label>
              <input
                name="email"
                type="email"
                value={orderForm.email}
                onChange={handleFormChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="buy-field">
              <label>Delivery Address *</label>
              <textarea
                name="address"
                value={orderForm.address}
                onChange={handleFormChange}
                placeholder="Full address with landmark"
                rows={3}
              />
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
                <input
                  name="pincode"
                  value={orderForm.pincode}
                  onChange={handleFormChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="buy-field">
              <label>Order Notes (Optional)</label>
              <textarea
                name="notes"
                value={orderForm.notes}
                onChange={handleFormChange}
                placeholder="Any special instructions"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="buy-actions">
          <button className="buy-btn buy-outline" onClick={safeClose} disabled={orderLoading} type="button">
            Cancel
          </button>

          <button
            className="buy-btn buy-primary"
            onClick={primaryClick}
            disabled={orderLoading || (useRazorpay && !RZP_KEY_ID)}
            type="button"
          >
            {orderLoading ? (
              <>
                <span className="buy-miniSpin" />
                Processing...
              </>
            ) : (
              primaryLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
