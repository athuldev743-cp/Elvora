// src/pages/Products.jsx
import React from "react";
import "./Products.css";

const Products = () => {
  return (
    <section className="products-page">
      <h1>All Products</h1>
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="product-card" key={index}>
            <div className={`product-image product-${index + 1}`}></div>
            <span className="product-name">Product Name</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;