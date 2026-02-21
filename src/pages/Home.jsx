// src/pages/Home.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";
import { User } from "lucide-react";
import Hero3D from "../components/Hero3D";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  // Cache-First Initialization
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedProducts");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(products.length === 0);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  // inside Home.jsx component (near other useState)
const [showGame, setShowGame] = useState(false);

  // keep state, but no longer used to block navigation
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
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // ignore invalid localstorage
      }
    }

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

  // --- LOGIN NAVIGATION (Option A) ---
  const handleGoogleLogin = (e) => {
    if (e) e.preventDefault();
    navigate("/login");
  };

  const priorityOneProduct = useMemo(() => {
    return products.find((p) => Number(p.priority) === 1) || products[0];
  }, [products]);

  const goToPriorityOneProduct = () => {
    if (!priorityOneProduct) return;
    if (!user) return navigate("/login");
    navigate(`/products/${priorityOneProduct.id}`);
  };

  const closeMenu = () => setMenuOpen(false);
  const goToAdminDashboard = () => user?.isAdmin && navigate("/admin/dashboard");

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <img
            src="/images/logo.png"
            alt="ELVORA"
            className="logo-img"
            onError={(e) => {
            e.currentTarget.style.display = "none"; }}
                  
          />
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
                {user.profile_pic ? (
                  <img src={user.profile_pic} className="accountAvatar" alt="Profile" />
                ) : (
                  <User size={20} />
                )}
              </button>
              {user.isAdmin && (
                <button className="admin-dashboard-btn" onClick={goToAdminDashboard}>
                  Dashboard
                </button>
              )}
            </div>
          ) : (
            <button type="button" className="login-nav-btn" onClick={handleGoogleLogin} disabled={loginBusy}>
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
                <div
                  className="mobileUserCard"
                  onClick={() => {
                    navigate("/account");
                    closeMenu();
                  }}
                >
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
                  type="button"
                  className="mobileLoginBtn"
                  onClick={(e) => {
                    handleGoogleLogin(e);
                    closeMenu();
                  }}
                >
                  Login
                </button>
              )}
            </div>

            <div className="mobileMenuLinks">
              <a className="mobileMenuItem" href="#products" onClick={closeMenu}>
                Products
              </a>
              <a className="mobileMenuItem" href="#about" onClick={closeMenu}>
                About
              </a>
              <a className="mobileMenuItem" href="#blog" onClick={closeMenu}>
                Blog
              </a>
              <a className="mobileMenuItem" href="#testimonials" onClick={closeMenu}>
                Testimonials
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- 3D HERO SECTION --- */}
     {/* --- 3D HERO SECTION --- */}
     <section
  className="intro-3d-section"
  style={{
    backgroundImage: showGame
      ? `url(${process.env.PUBLIC_URL}/images/${isMobile ? "gameproduct-mobile.png" : "gameproduct.png"})`
      : `url(${process.env.PUBLIC_URL}/images/${isMobile ? "gamecover-mobile.png" : "gamecover.png"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden",
  }}
>
  {!showGame ? (
    <div className="gameCoverOverlay">
      <div className="gameCoverContent">
        <div className="gameCoverBadge">Mini Game</div>
        <h1 className="gameCoverTitle">Catch The Bananas</h1>
        <p className="gameCoverSub">
          Bananas fall from the sky. Move the container left/right to catch them. Score goes up, speed increases.
        </p>

        <button className="gameCoverBtn" type="button" onClick={() => setShowGame(true)}>
          Try Game
        </button>

        <a className="gameCoverSkip" href="#products">
          Skip & view products →
        </a>
      </div>
    </div>
  ) : (
    <Hero3D
      // ✅ pass the correct container images
      containerDesktop={`${process.env.PUBLIC_URL}/images/container.png`}
      containerMobile={`${process.env.PUBLIC_URL}/images/container-mobile.png`}
      isMobile={isMobile}
    />
  )}
</section>

      <section id="products" className="featuredPremium">
        <img className="featuredPremiumImg" src={priorityOneProduct?.image_url} alt="Hero" />
        <div className="featuredPremiumOverlay">
          <button className="primary-btn--featured" onClick={goToPriorityOneProduct}>
            SHOP NOW
          </button>
        </div>
      </section>

      <section id="about" className="pageSection">
        <About />
      </section>
      <section id="blog" className="pageSection">
        <Blog />
      </section>
      <section id="testimonials" className="pageSection">
        <Testimonial />
      </section>

      <Footer />
    </>
  );
}