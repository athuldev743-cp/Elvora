// src/api/adminAPI.js - UPDATED VERSION
const API_URL = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

export const adminLogin = async (email, password) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);

  // FIX: Change from /login to /admin/login
  const res = await fetch(`${API_URL}/admin/login`, { 
    method: "POST", 
    body: form 
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const createProduct = async (productData, token) => {
  const form = new FormData();
  Object.keys(productData).forEach((key) => form.append(key, productData[key]));

  // FIX: Change from /products to /admin/products
  const res = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getProducts = async (token) => {
  // FIX: Change from /products to /products (public) or /admin/products (admin-only)
  // Depends on your backend setup
  const res = await fetch(`${API_URL}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateProduct = async (id, data, token) => {
  const form = new FormData();
  Object.keys(data).forEach((key) => form.append(key, data[key]));

  // FIX: Change from /products/{id} to /admin/products/{id}
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteProduct = async (id, token) => {
  // FIX: Change from /products/{id} to /admin/products/{id}
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getOrders = async (token) => {
  // FIX: Change from /orders to /admin/orders
  const res = await fetch(`${API_URL}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};