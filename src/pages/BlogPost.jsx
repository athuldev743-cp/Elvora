import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { ALL_BLOGS } from "./Blog"; // Import the data from step 1
import "./Home.css"; // Reuse your existing CSS

export default function BlogPost() {
  // 1. Get the ID from the URL (e.g., /blog/1 -> id = "1")
  const { id } = useParams();
  
  // 2. Find the matching post
  const post = ALL_BLOGS.find((p) => p.id === parseInt(id));

  // 3. Scroll to top when page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return <div className="container" style={{padding: "100px", textAlign: "center"}}>Article not found</div>;
  }

  return (
    <div className="blog-post-page" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
      <div className="container">
        {/* Back Button */}
        <Link to="/" className="back-link" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "30px", textDecoration: "none", color: "#333", fontWeight: "600" }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>

        {/* Article Header */}
        <div className="article-header" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <span className="blog-category" style={{ position: "relative", top: 0, left: 0, display: "inline-block", marginBottom: "20px" }}>
            {post.category}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "20px", lineHeight: "1.2" }}>{post.title}</h1>
          
          <div className="blog-meta" style={{ justifyContent: "center", marginBottom: "40px" }}>
            <span className="meta-item"><Calendar size={16} /> {post.date}</span>
            <span className="meta-item"><Clock size={16} /> {post.readTime}</span>
            <span className="meta-item"><User size={16} /> {post.author}</span>
          </div>
        </div>

        {/* Main Image */}
        <div className="article-image-container" style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "50px", height: "500px" }}>
          <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Content Body */}
        <div 
          className="article-content" 
          style={{ maxWidth: "700px", margin: "0 auto", fontSize: "1.1rem", lineHeight: "1.8", color: "#444" }}
          // This allows us to render the HTML tags from our data
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>
    </div>
  );
}