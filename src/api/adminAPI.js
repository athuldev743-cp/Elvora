const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const adminLogin = async (email, password) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw await res.json().catch(() => ({ detail: "Login failed" }));
  return res.json();
};

export const getProducts = async (token) => {
  const res = await fetch(`${API_URL}/admin/products`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw await res.json().catch(() => ({ detail: "Fetch products failed" }));
  return res.json();
};

export const createProduct = async (formData, token) => {
  const res = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw await res.json().catch(() => ({ detail: "Create product failed" }));
  return res.json();
};

export const updateProduct = async (id, formData, token) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw await res.json().catch(() => ({ detail: "Update failed" }));
  return res.json();
};

export const deleteProduct = async (id, token) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw await res.json().catch(() => ({ detail: "Delete failed" }));
  return res.json();
};

export const getOrders = async (token) => {
  const res = await fetch(`${API_URL}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw await res.json().catch(() => ({ detail: "Fetch orders failed" }));
  return res.json();
};
