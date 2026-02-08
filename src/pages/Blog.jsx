// src/pages/Blog.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";

// --- 30 MOCK BLOG POSTS ---
const ALL_BLOGS = [
  {
    id: 1,
    title: "The 100-Banana Strength Secret",
    excerpt: "Discover the science behind our ripened banana powder and how it delivers sustained energy.",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    date: "Oct 12, 2023",
    readTime: "5 min read",
    author: "Dr. Sarah Wellness",
    category: "Science"
  },
  {
    id: 2,
    title: "First Foods: Banana Powder for Babies",
    excerpt: "A gentle, digestible, and nutrient-rich introduction to solids. Why pediatricians recommend it.",
    image: "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80",
    date: "Oct 15, 2023",
    readTime: "4 min read",
    author: "Mommy & Me",
    category: "Baby Nutrition"
  },
  {
    id: 3,
    title: "Post-Workout Recovery: Potassium Power",
    excerpt: "Forget synthetic shakes. How natural potassium aids muscle recovery and prevents cramping.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    date: "Oct 20, 2023",
    readTime: "6 min read",
    author: "Coach Mike",
    category: "Fitness"
  },
  {
    id: 4,
    title: "5 Gourmet Smoothie Recipes",
    excerpt: "Elevate your morning routine with these chef-curated smoothie bowls featuring banana powder.",
    image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80",
    date: "Oct 22, 2023",
    readTime: "3 min read",
    author: "Chef Anna",
    category: "Recipes"
  }
  // Add more items here if needed
];

export default function Blog() {
  const visibleBlogs = ALL_BLOGS.slice(0, 4);

  return (
    <div className="blog-section-container">
      <div className="blog-header">
        <h2 className="section-title">The Journal</h2>
        <p className="section-subtitle">Insights on health, nutrition, and the power of nature.</p>
      </div>

      <div className="blog-grid">
        {visibleBlogs.map((post) => (
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

      <div className="blog-footer">
        <Link to="/products" className="view-all-btn">View All Articles</Link>
      </div>
    </div>
  );
}