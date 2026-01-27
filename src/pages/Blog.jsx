import React from 'react';
import './Blog.css';

const Blog = () => {
  // Blog data with Unsplash image URLs
  const blogPosts = [
    {
      id: 1,
      title: "The Science Behind Hair Growth",
      excerpt: "Learn how Redensyl stimulates hair follicles for natural growth.",
      date: "Mar 15, 2024",
      category: "Science",
      readTime: "5 min read",
      // Unsplash image URL for hair science
      imageUrl: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "5 Natural Ingredients for Healthy Hair",
      excerpt: "Discover the power of natural botanicals in hair care.",
      date: "Feb 28, 2024",
      category: "Tips",
      readTime: "4 min read",
      // Unsplash image URL for natural ingredients
      imageUrl: "https://images.unsplash.com/photo-1607703703521-1d8d7f4a4a2c?auto=format&fit=crop&w-800&q=80"
    },
    {
      id: 3,
      title: "Daily Hair Care Routine for 2024",
      excerpt: "Optimize your hair care routine with our expert recommendations.",
      date: "Feb 10, 2024",
      category: "Routine",
      readTime: "6 min read",
      // Unsplash image URL for hair routine
      imageUrl: "https://images.unsplash.com/photo-1607522370275-f3b6f12c536d?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      title: "Understanding Hair Loss Causes",
      excerpt: "A comprehensive guide to common hair loss factors and solutions.",
      date: "Jan 25, 2024",
      category: "Education",
      readTime: "7 min read",
      // Unsplash image URL for hair education
      imageUrl: "https://images.unsplash.com/photo-1607434280055-5c8c5f5b5b5b?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Blog & Articles</h2>
          <p className="section-subtitle">Latest insights on hair care and wellness</p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.id}>
              <div className="blog-image">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  loading="lazy"  
                />
                <span className="blog-category">{post.category}</span>
              </div>
              
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>
                
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                
                <button className="blog-read-more">
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-cta">
          <button className="view-all-btn">View All Articles</button>
        </div>
      </div>
    </section>
  );
};

export default Blog;