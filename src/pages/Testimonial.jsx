import React, { useState } from 'react';
import './Testimonial.css';

const Testimonial = () => {
  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Using for 6 months",
      text: "After struggling with hair fall for years, Redensyl has been a game-changer. My hair is thicker and healthier than ever before!",
      rating: 5,
      image: "testimonial1.jpg"
    },
    {
      id: 2,
      name: "Rahul Mehta",
      role: "Customer for 1 year",
      text: "The best hair oil I've ever used. Natural ingredients and visible results within weeks. Highly recommended!",
      rating: 5,
      image: "testimonial2.jpg"
    },
    {
      id: 3,
      name: "Anjali Patel",
      role: "Professional Stylist",
      text: "I recommend Eka Bhumih products to all my clients. The quality is exceptional and results speak for themselves.",
      rating: 4,
      image: "testimonial3.jpg"
    },
    {
      id: 4,
      name: "Sanjay Kumar",
      role: "Using for 8 months",
      text: "Finally found a solution for my dandruff problem. The anti-dandruff shampoo works wonders without drying my hair.",
      rating: 5,
      image: "testimonial4.jpg"
    },
    {
      id: 5,
      name: "Meera Nair",
      role: "Customer for 2 years",
      text: "From hair loss to healthy growth - the transformation has been incredible. Thank you Eka Bhumih!",
      rating: 5,
      image: "testimonial5.jpg"
    },
    {
      id: 6,
      name: "Vikram Singh",
      role: "First-time user",
      text: "Impressed with the results in just 3 months. My hair looks fuller and feels stronger. Will continue using!",
      rating: 4,
      image: "testimonial6.jpg"
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const slidesToShow = 3; // Show 3 testimonials at a time on desktop

  // Next slide
  const nextSlide = () => {
    const maxSlide = Math.ceil(testimonials.length / slidesToShow) - 1;
    setActiveSlide(prev => prev >= maxSlide ? maxSlide : prev + 1);
  };

  // Previous slide
  const prevSlide = () => {
    setActiveSlide(prev => prev <= 0 ? 0 : prev - 1);
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "star filled" : "star"}>
            {i < rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <section id="testimonials" className="testimonial-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from real people about their transformation</p>
        </div>

        <div className="testimonial-container">
          <button className="testimonial-arrow prev" onClick={prevSlide}>
            &#10094;
          </button>

          <div className="testimonial-track">
            <div 
              className="testimonial-slider" 
              style={{ transform: `translateX(-${activeSlide * (100 / slidesToShow)}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div className="testimonial-card" key={testimonial.id}>
                  <div className="testimonial-content">
                    <div className="quote-icon">"</div>
                    <p className="testimonial-text">{testimonial.text}</p>
                    
                    <div className="testimonial-rating">
                      {renderStars(testimonial.rating)}
                      <span className="rating-text">{testimonial.rating}/5</span>
                    </div>
                  </div>
                  
                  <div className="testimonial-author">
                    <div className="author-image">
                      <img 
                        src={`${process.env.PUBLIC_URL}/images/${testimonial.image}`} 
                        alt={testimonial.name}
                      />
                    </div>
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.name}</h4>
                      <p className="author-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="testimonial-arrow next" onClick={nextSlide}>
            &#10095;
          </button>
        </div>

        {/* Indicators */}
        <div className="testimonial-indicators">
          {Array.from({ length: Math.ceil(testimonials.length / slidesToShow) }).map((_, index) => (
            <button
              key={index}
              className={`indicator ${activeSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="stats-container">
          <div className="stat-item">
            <h3 className="stat-number">10K+</h3>
            <p className="stat-label">Happy Customers</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">95%</h3>
            <p className="stat-label">Satisfaction Rate</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">50+</h3>
            <p className="stat-label">Cities Served</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">4.8★</h3>
            <p className="stat-label">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;