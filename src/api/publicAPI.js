// src/api/publicAPI.js - UPDATED WITH CORS PROXY
const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";
const USE_CORS_PROXY = true; // Set to true to use CORS proxy

// Public CORS proxy (choose one)
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://thingproxy.freeboard.io/fetch/",
  "https://cors-anywhere.herokuapp.com/"
];

// Helper function to get URL with CORS proxy if needed
const getUrl = (endpoint) => {
  if (USE_CORS_PROXY && typeof window !== 'undefined') {
    const proxy = CORS_PROXIES[0]; // Use first proxy
    return proxy + encodeURIComponent(API_BASE + endpoint);
  }
  return API_BASE + endpoint;
};

export async function fetchProducts() {
  const url = getUrl('/products');
  
  console.log("Fetching products from:", url);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://ekabhumi.vercel.app'
      },
      mode: 'cors'
    });
    
    console.log("Fetch response status:", res.status);
    
    if (!res.ok) {
      console.error("Fetch failed with status:", res.status);
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Fetched products:", data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return mock data as fallback
    return [
      { 
        id: 1, 
        name: "Redensyl Hair Growth Serum", 
        price: 299, 
        description: "Advanced hair growth serum with Redensyl complex", 
        image_url: "https://images.unsplash.com/photo-1601042879364-f3947d1f9fc9?w=400&h=400&fit=crop"
      },
      { 
        id: 2, 
        name: "Vitamin C Brightening Serum", 
        price: 499, 
        description: "Antioxidant serum for brighter, even-toned skin", 
        image_url: "https://images.unsplash.com/photo-1556228578-9c360e1d8d34?w-400&h=400&fit=crop"
      },
      { 
        id: 3, 
        name: "Hyaluronic Acid Hydrator", 
        price: 399, 
        description: "Intense hydration serum for plump, dewy skin", 
        image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop"
      }
    ];
  }
}

// Update other functions to use CORS proxy
export async function fetchProductById(id) {
  const url = getUrl(`/products/${id}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to fetch product: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Add this function to test CORS
export async function testBackendConnection() {
  try {
    const res = await fetch(getUrl('/'), {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("Backend connection successful:", data);
      return { success: true, data };
    } else {
      console.error("Backend connection failed:", res.status);
      return { success: false, status: res.status };
    }
  } catch (error) {
    console.error("Backend connection error:", error);
    return { success: false, error: error.message };
  }
}