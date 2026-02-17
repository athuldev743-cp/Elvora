import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";
import { User } from "lucide-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  
  // Cache-First Initialization
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedProducts");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const [loading, setLoading] = useState(products.length === 0);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [videoEnded, setVideoEnded] = useState(false);
  
  const [loginBusy, setLoginBusy] = useState(false);
  const navigate = useNavigate();

  // Scroll & Resize
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

  // Data Fetching
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) setUser(JSON.parse(userData));
    
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        if (Array.isArray(data)) {
          setProducts(data);
          localStorage.setItem("cachedProducts", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Using cached data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- FIXED LOGIN LOGIC ---
  const handleGoogleLogin = async (e) => {
    // 1. Prevent default browser behavior (Stopping the refresh)
    if (e) e.preventDefault(); 
    
    if (loginBusy) return;
    setLoginBusy(true);
    
    try {
        navigate("/login"); 
    } catch (error) {
        console.error("Login failed", error);
    } finally {
        setLoginBusy(false);
    }
  };

  const priorityOneProduct = useMemo(() => {
    return products.find(p => Number(p.priority) === 1) || products[0];
  }, [products]);

  const goToPriorityOneProduct = () => {
    if (priorityOneProduct) navigate(`/products/${priorityOneProduct.id}`);
  };

  const closeMenu = () => setMenuOpen(false);
  const goToAdminDashboard = () => user?.isAdmin && navigate("/admin/dashboard");

  return (
    <>
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

        <div className="auth-section desktop-only">
          {user ? (
            <div className="user-nav">
              <button className="accountBtn" onClick={() => navigate("/account")}>
                 {user.profile_pic ? <img src={user.profile_pic} className="accountAvatar" alt="Profile" /> : <User size={20} />}
              </button>
              {user.isAdmin && <button className="admin-dashboard-btn" onClick={goToAdminDashboard}>Dashboard</button>}
            </div>
          ) : (
            <button 
                type="button"  // <--- FIXED: Added type="button"
                className="login-nav-btn" 
                onClick={(e) => handleGoogleLogin(e)} // <--- FIXED: Passed event 'e'
                disabled={loginBusy}
            >
                {loginBusy ? "..." : "Login"}
            </button>
          )}
        </div>
      </nav>

      {/* --- HAMBURGER BUTTON --- */}
      {isMobile && (
        <button
          className={`hamburger mobile-fixed-btn ${menuOpen ? "open" : ""}`}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      )}

      {menuOpen && (
        <div className="mobileMenuOverlay" onClick={closeMenu}>
          <div className="mobileMenuPanel" onClick={(e) => e.stopPropagation()}>
            <div className="mobileMenuUserSection">
              {user ? (
                <div className="mobileUserCard" onClick={() => { navigate("/account"); closeMenu(); }}>
                   {user.profile_pic ? (
                     <img src={user.profile_pic} alt="Profile" className="mobileUserAvatar" />
                   ) : (
                     <div className="mobileUserAvatarPlaceholder">
                       <User size={24} color="#555" />
                     </div>
                   )}
                   <div className="mobileUserInfo">
                     <span className="mobileUserName">{user.name || "My Account"}</span>
                     <span className="mobileUserLink">View Profile</span>
                   </div>
                </div>
              ) : (
                <button 
                    type="button" // <--- FIXED: Added type="button"
                    className="mobileLoginBtn" 
                    onClick={(e) => { 
                        handleGoogleLogin(e); // <--- FIXED: Passed event 'e'
                        closeMenu(); 
                    }}
                >
                  Login / Sign Up
                </button>
              )}
            </div>

            <div className="mobileMenuLinks">
              <a className="mobileMenuItem" href="#products" onClick={closeMenu}>Products</a>
              <a className="mobileMenuItem" href="#about" onClick={closeMenu}>About</a>
              <a className="mobileMenuItem" href="#blog" onClick={closeMenu}>Blog</a>
              <a className="mobileMenuItem" href="#testimonials" onClick={closeMenu}>Testimonials</a>
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
            <h2 className="intro-title">Ripen banana powder<br />100 bananas strength</h2>
          </div>
        )}
      </section>

      <section id="products" className="featuredPremium">
        <img
          className="featuredPremiumImg"
          src={priorityOneProduct?.image_url}
          alt="Hero"
        />
        <div className="featuredPremiumOverlay">
          <button
            className="primary-btn--featured"
            onClick={goToPriorityOneProduct}
          >
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