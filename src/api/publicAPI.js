// src/api/publicAPI.js
const API_BASE =
  process.env.REACT_APP_API_URL || "https://elvora-backend-l2g3.onrender.com";

const getUrl = (endpoint) => API_BASE + endpoint;

// ✅ Helper to fix image URLs (handles local paths, backslashes, and Cloudinary)
const processImageUrl = (imageUrl) => {
  if (!imageUrl) return ""; // Return empty string if null

  let processed = imageUrl.replace(/\\/g, "/");
  
  // If it's already a full URL (Cloudinary, S3, etc.), return it
  if (processed.startsWith("http")) return processed;

  // Ensure it starts with /
  if (!processed.startsWith("/")) processed = "/" + processed;

  // specific fix for some cloudinary edge cases if protocol is missing
  if (processed.includes("res.cloudinary.com") && !processed.startsWith("http")) {
    return `https:${processed}`;
  }

  // Otherwise assume it's a local static file on the backend
  return `${API_BASE}${processed}`;
};

export async function fetchProducts() {
  const res = await fetch(getUrl("/products"), {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
    mode: "cors",
    credentials: "omit",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchProducts failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  // ✅ Process both image_url and image2_url
  return (Array.isArray(data) ? data : []).map((p) => ({
    ...p,
    image_url: processImageUrl(p.image_url),
    image2_url: processImageUrl(p.image2_url), // Handle second image
  }));
}

export async function fetchProductById(id) {
  const url = getUrl(`/products/${id}`);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch product: ${res.status} ${text}`);
  }

  const data = await res.json();

  // ✅ Process images for single product details too
  return {
    ...data,
    image_url: processImageUrl(data.image_url),
    image2_url: processImageUrl(data.image2_url),
  };
}

export async function createOrder(orderData) {
  const url = getUrl("/orders");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `Failed to create order (${res.status})`);
  }

  return await res.json();
}

export async function fetchOrdersByEmail(email) {
  const res = await fetch(
    getUrl(`/orders?email=${encodeURIComponent(email)}`),
    {
      headers: { Accept: "application/json" },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
  }

  return await res.json();
}

export async function createRazorpayOrder(amount) {
  const res = await fetch(getUrl("/payments/create-razorpay-order"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }), // amount in rupees
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`createRazorpayOrder failed: ${res.status} ${text}`);
  }

  return await res.json(); // { id, amount, currency, ... }
}

export async function verifyRazorpayPayment(payRes) {
  const res = await fetch(getUrl("/payments/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payRes),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Payment verify failed: ${res.status} ${text}`);
  }
  return await res.json();
}