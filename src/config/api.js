// src/config/api.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "",
  
  // Endpoints
  ENDPOINTS: {
    ADMIN: {
      LOGIN: "/admin/login",
      PRODUCTS: "/admin/products",
      ORDERS: "/admin/orders"
    },
    PUBLIC: {
      PRODUCTS: "/products"
    }
  }
};