import { useState, useEffect } from "react";
import { createProduct, getProducts, updateProduct, deleteProduct, getOrders } from "./api/adminAPI";
import styles from "./Dashboard.module.css";

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: "", price: "", description: "", priority: "", email: "", image: null
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("adminToken");

  const fetchProducts = async () => {
    const data = await getProducts(token);
    setProducts(data);
  };

  const fetchOrders = async () => {
    const data = await getOrders(token);
    setOrders(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

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
  };

  const handleDelete = async (id) => {
    await deleteProduct(id, token);
    fetchProducts();
  };

  const handleUpdate = async (id, updatedData) => {
    await updateProduct(id, updatedData, token);
    fetchProducts();
  };

  return (
    <div className={styles.container}>
      <h2>Upload Product</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="price" placeholder="Price" type="number" onChange={handleChange} required />
        <input name="description" placeholder="Description" onChange={handleChange} required />
        <input name="priority" placeholder="Priority" type="number" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="image" type="file" onChange={handleChange} required />
        <button type="submit">Upload</button>
      </form>

      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price} 
            <button onClick={() => handleDelete(p.id)}>Delete</button>
            {/* You can add an edit form here */}
          </li>
        ))}
      </ul>

      <h2>Orders</h2>
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
