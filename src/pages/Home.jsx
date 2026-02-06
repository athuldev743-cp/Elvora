// src/pages/Home.jsx
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
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  // Google Sign-In guards
  const gsiReadyRef = useRef(false);
  const gsiInitRef = useRef(false);
  const gsiPromptingRef = useRef(false);
  const [loginBusy, setLoginBusy] = useState(false);

  const trackRef = useRef(null);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  // resize close menu (desktop)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 992) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // lock body scroll when menu open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // load existing user
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) return;
    try {
      setUser(JSON.parse(userData));
    } catch {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminToken");
    }
  }, []);

  // mobile breakpoint
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // products loader
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Temporary issue loading products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    const syncProducts = (e) => {
      if (e.key === "productsUpdated") loadProducts();
    };
    window.addEventListener("storage", syncProducts);

    const onFocus = () => loadProducts();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", syncProducts);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadProducts]);

  // load Google script once
  useEffect(() => {
    if (document.getElementById("gsi-script")) return;

    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      gsiReadyRef.current = true;
    };

    script.onerror = () => {
      console.error("Failed to load Google GSI script");
      gsiReadyRef.current = false;
    };

    document.body.appendChild(script);
  }, []);

  const handleGoogleResponse = useCallback(
    async (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        const userEmail = payload.email;

        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        const role = isAdmin ? "admin" : "user";

        const userData = {
          name: payload.name,
          email: userEmail,
          profile_pic: payload.picture,
          role,
          isAdmin,
        };

        localStorage.setItem("userToken", response.credential);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);

        // optional server-side JWT for admin tools
        try {
          const jwtResponse = await convertGoogleToJWT(response.credential);
          if (jwtResponse?.access_token) {
            localStorage.setItem("adminToken", jwtResponse.access_token);
          }
        } catch (jwtError) {
          console.error("JWT conversion failed:", jwtError);
        }

        closeMenu();
        alert(isAdmin ? `Welcome Admin ${userData.name}!` : `Welcome ${userData.name}!`);
      } catch (err) {
        console.error("Login failed:", err);
        alert("Login failed. Please try again.");
      } finally {
        gsiPromptingRef.current = false;
        setLoginBusy(false);
      }
    },
    [closeMenu]
  );

  const ensureGsiInitialized = useCallback(() => {
    if (!gsiReadyRef.current || !window.google) return false;
    if (gsiInitRef.current) return true;

    if (!GOOGLE_CLIENT_ID) {
      console.error("Missing REACT_APP_GOOGLE_CLIENT_ID");
      return false;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => handleGoogleResponse(resp),
    });

    gsiInitRef.current = true;
    return true;
  }, [handleGoogleResponse]);

  const handleGoogleLogin = useCallback(() => {
    if (loginBusy || gsiPromptingRef.current) return;

    if (!gsiReadyRef.current || !window.google) {
      alert("Google login loading... Please try again.");
      return;
    }

    const ok = ensureGsiInitialized();
    if (!ok) {
      alert("Google login not ready. Please check client ID / script load.");
      return;
    }

    gsiPromptingRef.current = true;
    setLoginBusy(true);

    window.google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        gsiPromptingRef.current = false;
        setLoginBusy(false);
      }
    });

    setTimeout(() => {
      gsiPromptingRef.current = false;
      setLoginBusy(false);
    }, 5000);
  }, [ensureGsiInitialized, loginBusy]);

  const goToAdminDashboard = () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData && (userData.role === "admin" || userData.isAdmin === true)) {
      closeMenu();
      navigate("/admin/dashboard");
    } else {
      alert("Access denied. Admin privileges required.");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/images/logo-placeholder.png";
  };

  // Priority-1 product (featured)
  const priorityOneProduct = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const p1 = list.find((p) => Number(p.priority) === 1);
    if (p1) return p1;
    return [...list].sort((a, b) => Number(a.priority ?? 9999) - Number(b.priority ?? 9999))[0] || null;
  }, [products]);

  // Only priority=2 for carousel (NO fallback)
  const priority2Products = useMemo(() => {
    return (Array.isArray(products) ? products : []).filter((p) => Number(p.priority) === 2);
  }, [products]);

  const goToPriorityOneProduct = useCallback(() => {
    const top = priorityOneProduct;

    if (!top?.id) {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!user) {
      handleGoogleLogin();
      return;
    }

    navigate(`/products/${top.id}`);
  }, [priorityOneProduct, user, handleGoogleLogin, navigate]);

  const scrollCarousel = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector(".product-card");
    const gap = 16;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.85;

    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  const MobileRightButton = () => {
    if (!user) {
      return (
        <button className="login-nav-btn mobile-only" onClick={handleGoogleLogin} disabled={loginBusy}>
          {loginBusy ? "Signing in..." : "Login"}
        </button>
      );
    }

    return (
      <button
        className="hamburger mobile-only"
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>
    );
  };

  return (
    <>
      {/* NAV */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          {!scrolled ? (
            <img src="/images/logo.png" alt="ELVORA" className="logo-img" onError={handleLogoError} />
          ) : (
            <span className="text-logo"></span>
          )}
        </div>

        <div className="nav-links desktop-only">
          <a href="#company">Company</a>
          <a href="#featured">Featured</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#blog">Blog</a>
          <a href="#testimonials">Testimonials</a>
        </div>

        <div className="auth-section desktop-only">
          {user ? (
            <div className="user-nav">
              <button className="accountBtn" title="Account" type="button" onClick={() => navigate("/account")}>
                {user.profile_pic ? (
                  <img src={user.profile_pic} alt="Account" className="accountAvatar" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} />
                )}
              </button>

              <span className="user-greeting">Hi, {user.name}</span>

              {user.isAdmin === true && (
                <button className="admin-dashboard-btn" onClick={goToAdminDashboard}>
                  Admin Dashboard
                </button>
              )}
            </div>
          ) : (
            <button className="login-nav-btn" onClick={handleGoogleLogin} disabled={loginBusy}>
              {loginBusy ? "Signing in..." : "Login"}
            </button>
          )}
        </div>

        {isMobile && <MobileRightButton />}
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && user && (
        <div className="mobileMenuOverlay" onMouseDown={closeMenu}>
          <div className="mobileMenuPanel" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mobileMenuHeader">
              <button type="button" className="mobileMenuBack" onClick={closeMenu} aria-label="Back">
                ←
              </button>
              <div className="mobileMenuTitle">Menu</div>
              <div className="mobileMenuSpacer" />
            </div>

            <div className="mobileMenuSection">
              <button
                className="mobileMenuItem"
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate("/account");
                }}
              >
                <span className="mmIcon">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="Account" className="mmAvatar" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={18} />
                  )}
                </span>
                Account
              </button>
            </div>

            <div className="mobileMenuSection">
              <a className="mobileMenuItem" href="#company" onClick={closeMenu}>
                Company
              </a>
              <a className="mobileMenuItem" href="#featured" onClick={closeMenu}>
                Featured
              </a>
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

            {user?.isAdmin === true && (
              <div className="mobileMenuSection">
                <button className="mobileMenuItem" type="button" onClick={goToAdminDashboard}>
                  Admin Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1) COMPANY VISION */}
      <section id="company" className="companyHero">
        <img
          className="companyHeroImg"
          src="/images/company-vision.png"
          alt="ELVORA vision"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/1600x900/EEE/31343C?text=Company+Vision";
          }}
        />
        <div className="companyHeroOverlay">
          <div className="companyHeroCard">
            <span className="companyHeroKicker">ELVORA</span>
            <h1 className="companyHeroTitle">Vision-led care. Clean, consistent, everyday.</h1>
            <p className="companyHeroDesc">
              We build premium personal-care products with comfort-first formulas and clear purpose — simple routines
              that actually work.
            </p>
            <div className="companyHeroCtas">
              <button
                className="primary-btn"
                type="button"
                onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}
              >
                See Featured Product
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2) FEATURED (inline background to avoid CSS resolve errors) */}
      <section
        id="featured"
        className="featuredSplit"
        style={{
          backgroundImage: "url(/images/hero-desktop.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="featuredLeft">
          <span className="featuredKicker">Featured Product</span>

          <h2 className="featuredName">{priorityOneProduct?.name || "Top Product"}</h2>

          <div className="featuredHighlights">
            <div className="fhItem">Clean ingredients • gentle everyday use</div>
            <div className="fhItem">Fast absorption • non-greasy finish</div>
            <div className="fhItem">Designed for consistent long-term care</div>
            <div className="fhItem">Premium feel • simple routine</div>
          </div>

          <button
            className="primary-btn"
            type="button"
            onClick={goToPriorityOneProduct}
            disabled={!priorityOneProduct?.id}
          >
            Shop Now
          </button>

          {!priorityOneProduct?.id && (
            <p style={{ marginTop: 10, color: "#333", fontWeight: 700 }}>
              ⚠️ No featured product found (priority=1). Set one in admin.
            </p>
          )}
        </div>

        <div className="featuredRight">
          <img
            className="featuredImg"
            src={priorityOneProduct?.image_url || "/images/feature-placeholder.png"}
            alt={priorityOneProduct?.name || "Featured product"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/1200x1200/EEE/31343C?text=Priority+1+Product";
            }}
          />
        </div>
      </section>

      {/* 3) PRODUCTS CAROUSEL (ONLY PRIORITY=2) */}
      <section id="products" className="product-preview">
        {error && <div className="error-message">⚠️ {error}</div>}
        {loading && <p className="loading-text">Loading products...</p>}

        {!loading && priority2Products.length === 0 && !error && (
          <p style={{ textAlign: "center", color: "#666" }}>No priority-2 products available</p>
        )}

        {!loading && priority2Products.length > 0 && (
          <div className="carousel-container">
            <button className="carousel-arrow prev" onClick={() => scrollCarousel("prev")} type="button" aria-label="Previous">
              ‹
            </button>

            <div className="carousel-track" ref={trackRef}>
              {priority2Products.map((p) => {
                const qty = Number(p.quantity ?? 0);
                const availableSoon = qty <= 0;

                const onView = () => {
                  if (availableSoon) return;
                  if (!user) return handleGoogleLogin();
                  navigate(`/products/${p.id}`);
                };

                return (
                  <div className="product-card" key={p.id}>
                    {availableSoon && <div className="available-soon-badge">Available Soon</div>}

                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/400x300/EEE/31343C?text=Product+Image";
                      }}
                    />

                    <div className="product-info">
                      <span className="product-name">{p.name}</span>

                      <button
                        className={`view-details-btn ${availableSoon ? "isDisabled" : ""}`}
                        onClick={onView}
                        type="button"
                        disabled={availableSoon}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="carousel-arrow next" onClick={() => scrollCarousel("next")} type="button" aria-label="Next">
              ›
            </button>
          </div>
        )}
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

