import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Testimonial.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Testimonial = () => {
  const testimonials = useMemo(
  () => [
    {
      id: 1,
      name: "Anitha Menon",
      role: "Mother of 2",
      text: "Elvora ripened Nendran nutrition powder has become a daily staple for my kids. Easy to digest, filling, and completely natural.",
      rating: 5,
      image: "testimonial1.jpg",
    },
    {
      id: 2,
      name: "Arjun Nair",
      role: "Fitness Enthusiast",
      text: "I use the Nendran powder as a morning drink. Keeps me energetic for hours and tastes authentic, not artificial.",
      rating: 5,
      image: "testimonial2.jpg",
    },
    {
      id: 3,
      name: "Dr. Meera Krishnan",
      role: "Nutrition Consultant",
      text: "Ripened Nendran banana powder is excellent for gut health and energy. Elvora maintains purity and traditional processing.",
      rating: 5,
      image: "testimonial3.jpg",
    },
    {
      id: 4,
      name: "Rohit Sharma",
      role: "Office Professional",
      text: "The carbonated drink is refreshing without being overly sweet. Perfect alternative to regular soft drinks.",
      rating: 4,
      image: "testimonial4.jpg",
    },
    {
      id: 5,
      name: "Neha Verma",
      role: "Regular Customer",
      text: "Loved the mild fizz and natural flavor. You don’t feel bloated like other carbonated beverages.",
      rating: 5,
      image: "testimonial5.jpg",
    },
    {
      id: 6,
      name: "Suresh Pillai",
      role: "Food Blogger",
      text: "Elvora’s nutrition powder and carbonated drinks reflect a balance of tradition and modern taste. Very impressive quality.",
      rating: 5,
      image: "testimonial6.jpg",
    },
  ],
  []
);


  const trackRef = useRef(null);

  // enable/disable arrows based on scroll position
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateButtons();

    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByOneCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector(".testimonial-card");
    const gap = 16;

    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  const handleAvatarError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/120x120/EEE/31343C?text=User";
  };

  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from real people</p>
        </div>

        <div className="testimonial-shell">
          <button
            className="testimonial-arrow prev"
            onClick={() => scrollByOneCard("prev")}
            disabled={!canPrev}
            type="button"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="testimonial-track" ref={trackRef}>
            {testimonials.map((t) => (
              <article className="testimonial-card" key={t.id}>
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p className="testimonial-text">{t.text}</p>
                </div>

                <div className="testimonial-author">
                  <div className="author-image">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/${t.image}`}
                      alt={t.name}
                      onError={handleAvatarError}
                      loading="lazy"
                    />
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">{t.name}</h4>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            className="testimonial-arrow next"
            onClick={() => scrollByOneCard("next")}
            disabled={!canNext}
            type="button"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
