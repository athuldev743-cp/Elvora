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
  
  // ✅ 1. CACHE-FIRST INITIALIZATION
  // We initialize state directly from localStorage. 
  // This ensures products appear INSTANTLY, even if the backend is asleep.
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedProducts");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Loading is only true if we have ZERO data (no cache, no fetch yet)
  const [loading, setLoading] = useState(products.length === 0);
  
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

  // --- Load User & Fetch Products (Background Update) ---
  useEffect(() => {
    // 1. Load User
    const userData = localStorage.getItem("userData");
    if (userData) setUser(JSON.parse(userData));
    
    // 2. Fetch Products Silently
    // This runs in the background. If the backend is cold, the user 
    // still sees the cached products from line 22 while this waits.
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        if (Array.isArray(data)) {
          setProducts(data);
          // ✅ Update Cache for next time
          localStorage.setItem("cachedProducts", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Backend might be cold or offline. Using cached data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Google Login Logic ---
  const handleGoogleLogin = () => {
    if (loginBusy) return;
    alert("Please ensure Google Client ID is set in .env and init logic is present.");
  };

  const priorityOneProduct = useMemo(() => {
    return products.find(p => Number(p.priority) === 1) || products[0];
  }, [products]);

  const goToPriorityOneProduct = () => {
    if (priorityOneProduct) navigate(`/products/${priorityOneProduct.id}`);
  };

  const closeMenu = () => setMenuOpen(false);
  
  const goToAdminDashboard = () => {
    if (user?.isAdmin) navigate("/admin/dashboard");
  };

  // --- Mobile Hamburger Button ---
  const MobileRightButton = () => {
    return (
      <button
        className="hamburger mobile-only"
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>
    );
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
          <a href="#testimonials">Testimonials</a>
        </div>

        {/* --- DESKTOP AUTH SECTION --- */}
        <div className="auth-section desktop-only">
          {user ? (
            <div className="user-nav">
              <button 
                className="accountBtn" 
                title="Account" 
                onClick={() => navigate("/account")}
                style={{ borderColor: scrolled ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.4)" }}
              >
                {user.profile_pic ? (
                  <img src={user.profile_pic} alt="Account" className="accountAvatar" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} color={scrolled ? "#333" : "#fff"} />
                )}
              </button>

              <span className="user-greeting" style={{ color: scrolled ? "#333" : "#fff" }}>
                Hi, {user.name}
              </span>

              {user.isAdmin === true && (
                <button className="admin-dashboard-btn" onClick={goToAdminDashboard}>
                  Dashboard
                </button>
              )}
            </div>
          ) : (
            <button className="login-nav-btn" onClick={handleGoogleLogin}>
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        {isMobile && <MobileRightButton />}
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {menuOpen && (
        <div className="mobileMenuOverlay" onMouseDown={closeMenu}>
          <div className="mobileMenuPanel" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mobileMenuHeader">
              <button className="mobileMenuBack" onClick={closeMenu}>←</button>
              <div className="mobileMenuTitle">Menu</div>
            </div>

            <div className="mobileMenuSection">
              <a className="mobileMenuItem" href="#products" onClick={closeMenu}>Products</a>
              <a className="mobileMenuItem" href="#about" onClick={closeMenu}>About</a>
              <a className="mobileMenuItem" href="#blog" onClick={closeMenu}>Blog</a>
              <a className="mobileMenuItem" href="#testimonials" onClick={closeMenu}>Testimonials</a>
            </div>

            <div className="mobileMenuSection">
              {user ? (
                 <>
                   <button className="mobileMenuItem" onClick={() => { closeMenu(); navigate("/account"); }}>
                     <span className="mmIcon">
                       {user.profile_pic ? <img src={user.profile_pic} className="mmAvatar" /> : <User size={18} />}
                     </span>
                     Account
                   </button>
                   {user.isAdmin && (
                     <button className="mobileMenuItem" onClick={() => { closeMenu(); navigate("/admin/dashboard"); }}>
                        Admin Dashboard
                     </button>
                   )}
                 </>
              ) : (
                <button className="mobileMenuItem" onClick={handleGoogleLogin}>Login</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- VIDEO SECTION --- */}
      <section className="intro-video-section">
        <video 
          src="/videos/bananastrength.mp4" 
          autoPlay 
          muted 
          playsInline 
          className="intro-video"
          onEnded={() => setVideoEnded(true)} 
        />
        
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
      <section id="testimonials" className="pageSection"><Testimonial /></section>

      <Footer />
    </>
  );
}