import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial"; // Import Testimonial
import Footer from "./Footer";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  
  // Products data
  const products = [
    { id: 1, name: "Hair Growth Oil", price: "$24.99" },
    { id: 2, name: "Anti-Dandruff Shampoo", price: "$19.99" },
    { id: 3, name: "Scalp Serum", price: "$29.99" },
    { id: 4, name: "Hair Conditioner", price: "$17.99" },
    { id: 5, name: "Hair Mask", price: "$22.99" },
    { id: 6, name: "Hair Tonic", price: "$26.99" },
    { id: 7, name: "Scalp Scrub", price: "$18.99" },
    { id: 8, name: "Hair Spray", price: "$15.99" },
  ];

  // Get number of visible cards based on screen width
  const getVisibleCards = () => {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
  };

  // Get total slides
  const getTotalSlides = () => {
    const visibleCards = getVisibleCards();
    return Math.max(0, Math.ceil(products.length / visibleCards) - 1);
  };

  // Next slide
  const nextSlide = () => {
    const totalSlides = getTotalSlides();
    setCurrentSlide(prev => prev >= totalSlides ? totalSlides : prev + 1);
  };

  // Previous slide
  const prevSlide = () => {
    setCurrentSlide(prev => prev <= 0 ? 0 : prev - 1);
  };

  // Go to specific slide
  const goToSlide = (index) => {
    const totalSlides = getTotalSlides();
    if (index >= 0 && index <= totalSlides) {
      setCurrentSlide(index);
    }
  };

  // Update carousel position
  useEffect(() => {
    if (trackRef.current && containerRef.current) {
      const visibleCards = getVisibleCards();
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = containerWidth / visibleCards;
      const gap = 30; // From CSS gap: 30px
      const totalWidth = cardWidth + gap;
      const translateX = -(currentSlide * totalWidth * visibleCards);
      
      trackRef.current.style.transform = `translateX(${translateX}px)`;
    }
  }, [currentSlide]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    const handleClick = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("scroll", handleScroll);
    const links = document.querySelectorAll(".navbar a[href^='#']");
    links.forEach(link => link.addEventListener("click", handleClick));

    // Handle window resize
    const handleResize = () => {
      setCurrentSlide(0); // Reset to first slide on resize
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('resize', handleResize);
      links.forEach(link => link.removeEventListener("click", handleClick));
    };
  }, [scrolled]);

  // Calculate indicators
  const totalSlides = getTotalSlides();

  return (
    <>
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <img 
            src="/images/logo.png"

            alt="Eka Bhumih Logo" 
            className="logo-img" 
          />
          <span className="text-logo">EKA BHUMI</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#blog">Blog</a>
          <a href="#testimonials">Testimonials</a> {/* Fixed href to match section ID */}
          
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="hero"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/redensyl-hero.jpg)`
        }}
      >
        <div className="hero-content">
          <button className="primary-btn">Shop Now</button>
        </div>
      </section>

      {/* PRODUCT CAROUSEL */}
      <section id="products" className="product-preview">
        <h2>Our Products</h2>
        
        <div className="carousel-container" ref={containerRef}>
          <button className="carousel-arrow prev" onClick={prevSlide}>
            &#10094; {/* Left arrow */}
          </button>
          
          <div className="carousel-track" ref={trackRef}>
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <img
                  src={`${process.env.PUBLIC_URL}/images/p${product.id}.jpg`}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">{product.price}</span>
                  <button className="product-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-arrow next" onClick={nextSlide}>
            &#10095; {/* Right arrow */}
          </button>
        </div>

        {/* Indicators - Only show if we have multiple slides */}
        {totalSlides > 0 && (
          <div className="carousel-indicators">
            {Array.from({ length: totalSlides + 1 }).map((_, index) => (
              <button
                key={index}
                className={`indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTIONS */}
      <section id="about"><About /></section>
      
      {/* BLOG SECTION */}
      <Blog />
      
      {/* TESTIMONIAL SECTION - ADD THIS */}
      <Testimonial />

      <Footer />
      
    </>
  );
};

export default Home;