// src/api/product.js

const API_URL = "http://127.0.0.1:8000"; // your FastAPI backend

export async function createProduct({ name, price, description, priority, email, image }) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("email", email);
    formData.append("image", image);

    const response = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}
