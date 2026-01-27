import { useState, useEffect, useCallback } from "react";
import { createProduct, getProducts, deleteProduct, getOrders } from "../api/adminAPI";
import styles from "./Dashboard.module.css";

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: "", price: "", description: "", priority: "", email: "", image: null
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("adminToken");

  // Use useCallback to memoize functions
  const fetchProducts = useCallback(async () => {
    const data = await getProducts(token);
    setProducts(data);
  }, [token]);

  const fetchOrders = useCallback(async () => {
    const data = await getOrders(token);
    setOrders(data);
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]); // Now includes dependencies

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProduct(formData, token);
    alert("Product uploaded");
    fetchProducts();
    // Reset form
    setFormData({
      name: "", price: "", description: "", priority: "", email: "", image: null
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id, token);
      fetchProducts();
    }
  };

  // Optional: Remove or implement handleUpdate
  // const handleUpdate = async (id, updatedData) => {
  //   await updateProduct(id, updatedData, token);
  //   fetchProducts();
  // };

  return (
    <div className={styles.container}>
      <h2>Upload Product</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input 
          name="name" 
          placeholder="Name" 
          value={formData.name}
          onChange={handleChange} 
          required 
        />
        <input 
          name="price" 
          placeholder="Price" 
          type="number" 
          value={formData.price}
          onChange={handleChange} 
          required 
        />
        <input 
          name="description" 
          placeholder="Description" 
          value={formData.description}
          onChange={handleChange} 
          required 
        />
        <input 
          name="priority" 
          placeholder="Priority" 
          type="number" 
          value={formData.priority}
          onChange={handleChange} 
          required 
        />
        <input 
          name="email" 
          placeholder="Email" 
          type="email" 
          value={formData.email}
          onChange={handleChange} 
          required 
        />
        <input 
          name="image" 
          type="file" 
          onChange={handleChange} 
          required 
        />
        <button type="submit">Upload</button>
      </form>

      <h2>Products ({products.length})</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> - ${p.price} 
            <p>{p.description}</p>
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Orders ({orders.length})</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.customer_email} - {o.status} - Total: ${o.total}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;