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
import { User } from "lucide-react"; // ✅ you were using <User/> but import was missing

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  // ✅ Google Sign-In guards
  const gsiReadyRef = useRef(false);
  const gsiInitRef = useRef(false);
  const gsiPromptingRef = useRef(false);
  const [loginBusy, setLoginBusy] = useState(false);

  // ✅ Video ref (plays once)
  const videoRef = useRef(null);

  const trackRef = useRef(null);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  // --- resize close menu (desktop)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 992) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- lock body scroll when menu open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // --- load existing user
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

  // --- mobile breakpoint
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- products loader
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Temporary issue loading products.");
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
    return () => window.removeEventListener("storage", syncProducts);
  }, [loadProducts]);

  useEffect(() => {
    const onFocus = () => loadProducts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadProducts]);

  // ✅ Load Google script ONCE
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

  useEffect(() => {
  const v = videoRef.current;
  if (!v) return;

  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        v.play().catch((err) => {
          console.log("Autoplay blocked:", err);
        });
        obs.disconnect(); // ✅ play only once
      }
    },
    { threshold: 0.5 }
  );

  obs.observe(v);
  return () => obs.disconnect();
}, []);


  // ✅ Handle Google response (credential)
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

  // ✅ Init GSI only ONCE
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

  // ✅ Login handler: prevents concurrent prompt() calls
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

  // ✅ Priority-1 CTA -> product details
  const goToPriorityOneProduct = () => {
    if (!products?.length) {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const priorityOne = products.find((p) => Number(p.priority) === 1);
    const top =
      priorityOne ||
      [...products].sort((a, b) => Number(a.priority ?? 9999) - Number(b.priority ?? 9999))[0];

    if (!top?.id) {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!user) {
      handleGoogleLogin();
      return;
    }

    navigate(`/products/${top.id}`);
  };

  // ✅ Priority-2 products for carousel
  const priority2Products = useMemo(() => {
    const list = (Array.isArray(products) ? products : []).filter((p) => Number(p.priority) === 2);
    return list.length ? list : products; // fallback optional
  }, [products]);

  // ✅ Carousel scroll
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
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          {!scrolled ? (
            <img src="/images/logo.png" alt="ELVORA" className="logo-img" onError={handleLogoError} />
          ) : (
            <span className="text-logo"></span>
          )}
        </div>

        <div className="nav-links desktop-only">
          <a href="#home">Home</a>
          <a href="#ad">Ad</a>
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
              <a className="mobileMenuItem" href="#home" onClick={closeMenu}>
                Home
              </a>
              <a className="mobileMenuItem" href="#ad" onClick={closeMenu}>
                Ad
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

      {/* HERO */}
      <section id="home" className="hero" style={{ backgroundImage: "url(/images/hero-desktop.png)" }}>
        <div className="hero-cta desktop-only">
          <button className="primary-btn" onClick={goToPriorityOneProduct}>
            Shop Now
          </button>
        </div>

        <div className="hero-mobile-wrap">
          <img className="hero-mobile-img" src="/images/hero-mobile.png" alt="Elvora" loading="lazy" />
          <div className="hero-cta mobile-cta">
            <button className="primary-btn" onClick={goToPriorityOneProduct}>
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* HERO AD VIDEO – play once, no UI */}
      

      {/* PRODUCTS (Priority 2 carousel) */}
      <section id="products" className="product-preview">
        {error && <div className="error-message">⚠️ {error}</div>}
        {loading && <p className="loading-text">Loading products...</p>}

        {!loading && priority2Products.length === 0 && !error && (
          <p style={{ textAlign: "center", color: "#666" }}>No products available</p>
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
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/400x300/EEE/31343C?text=Product+Image";
                      }}
                      loading="lazy"
                    />

                    <div className="product-info">
                      <span className="product-name">{p.name}</span>

                      <button
                        className={`view-details-btn ${availableSoon ? "isDisabled" : ""}`}
                        onClick={onView}
                        type="button"
                        disabled={availableSoon}
                        title={availableSoon ? "Available soon" : user ? "View details" : "Login to view"}
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
};

export default Home;
