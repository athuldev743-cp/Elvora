import React, { useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Fixes 'Link' is not defined
import { ArrowRight, Calendar, Clock, ArrowLeft } from "lucide-react";
import { ALL_BLOGS } from "./Blog";      // ✅ Fixes 'ALL_BLOGS' is not defined
import "./Home.css";

export default function AllBlogs() {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="all-blogs-page" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <div className="blog-section-container">
        {/* Header with Back Button */}
        <div className="blog-header">
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#666", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="section-title">All Articles</h1>
          <p className="section-subtitle">Explore our complete collection of research, recipes, and wellness tips.</p>
        </div>

        {/* The Grid - Showing ALL posts */}
        <div className="blog-grid">
          {ALL_BLOGS.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-image-wrapper">
                <img src={post.image} alt={post.title} className="blog-image" />
                <span className="blog-category">{post.category}</span>
              </div>
              
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="meta-item"><Calendar size={14} /> {post.date}</span>
                  <span className="meta-item"><Clock size={14} /> {post.readTime}</span>
                </div>
                
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                
                <Link to={`/blog/${post.id}`} className="blog-read-more">
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}