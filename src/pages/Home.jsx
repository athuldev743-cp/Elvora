import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";
import { ADMIN_EMAILS } from "../config/auth";
import { convertGoogleToJWT } from "../api/adminAPI";
import { User } from "lucide-react";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [videoEnded, setVideoEnded] = useState(false);
  
  // Login & formatting refs
  const gsiReadyRef = useRef(false);
  const gsiInitRef = useRef(false);
  const gsiPromptingRef = useRef(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const navigate = useNavigate();

  // --- Scroll & Resize Handlers ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    const onResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // --- Load User & Products ---
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) setUser(JSON.parse(userData));
    
    // Quick load products
    fetchProducts().then(data => {
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // --- Google Login Logic ---
  const handleGoogleLogin = () => {
    alert("Please ensure Google Client ID is set in .env");
  };

  const priorityOneProduct = useMemo(() => {
    return products.find(p => Number(p.priority) === 1) || products[0];
  }, [products]);

  const goToPriorityOneProduct = () => {
    if (priorityOneProduct) navigate(`/products/${priorityOneProduct.id}`);
  };

  return (
    <>
      {/* --- NAVBAR --- */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <img src="/images/logo.png" alt="ELVORA" className="logo-img" onError={(e)=>e.target.style.display='none'} />
        </div>
        
        <div className="nav-links desktop-only">
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#blog">Blog</a>
          {/* Added Testimonials Link */}
          <a href="#testimonials">Testimonials</a>
        </div>

        <div className="auth-section desktop-only">
          <button className="login-nav-btn" onClick={handleGoogleLogin}>
            {user ? `Hi, ${user.name}` : "Login"}
          </button>
        </div>
      </nav>

      {/* --- VIDEO SECTION --- */}
      <section className="intro-video-section">
        <video 
          src="/videos/banana-strength-enhanced-1080.mp4" 
          autoPlay 
          muted 
          playsInline 
          className="intro-video"
          onEnded={() => setVideoEnded(true)} 
        />
        
        {/* TEXT OVERLAY */}
        {videoEnded && (
          <div className="intro-overlay">
            <h2 className="intro-title">
              Ripen banana powder<br />
              100 bananas strength
            </h2>
          </div>
        )}
      </section>

      {/* --- FEATURED PRODUCT --- */}
      <section id="products" className="featuredPremium">
        <img 
          className="featuredPremiumImg" 
          src={priorityOneProduct?.image_url || "https://via.placeholder.com/1200x600"} 
          alt="Hero Product" 
        />
        <div className="featuredPremiumOverlay">
          <button className="primary-btn primary-btn--featured" onClick={goToPriorityOneProduct}>
            SHOP NOW
          </button>
        </div>
      </section>

      <section id="about" className="pageSection"><About /></section>
      <section id="blog" className="pageSection"><Blog /></section>
      
      {/* --- TESTIMONIALS (Restored) --- */}
      <section id="testimonials" className="pageSection">
        <Testimonial />
      </section>

      <Footer />
    </>
  );
}