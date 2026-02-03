import React from "react";
import "./Blog.css";

const Blog = () => {
  // Blog data with Unsplash image URLs (UNCHANGED)
 // Blog data with Unsplash image URLs (UPDATED for Elvora food products)


 const blogPosts = [
  {
    id: 1,
    title: "Why Ripened Nendran Is a Nutrition Powerhouse",
    excerpt: "Learn how ripened Nendran supports energy, digestion, and everyday wellness.",
    date: "Mar 15, 2024",
    category: "Nutrition",
    readTime: "5 min read",
    imageUrl: "/images/nendran-banana.jpg",
  },
  {
    id: 2,
    title: "Easy Breakfast: Nendran Nutrition Powder Drinks",
    excerpt: "Quick recipes you can make in 2 minutes—perfect for kids and busy mornings.",
    date: "Feb 28, 2024",
    category: "Recipes",
    readTime: "4 min read",
    imageUrl: "/images/nendran-powder-drink.jpg",
  },
  {
    id: 3,
    title: "What Makes a Good Carbonated Drink?",
    excerpt: "Balance, mild fizz, and clean flavor—how to choose a refreshing beverage.",
    date: "Feb 10, 2024",
    category: "Beverages",
    readTime: "6 min read",
    imageUrl: "/images/carbonated-drink.jpg",
  },
  {
    id: 4,
    title: "Clean Ingredients: How to Read Food Labels",
    excerpt: "A simple guide to spotting fillers, added sugars, and what to prioritize instead.",
    date: "Jan 25, 2024",
    category: "Education",
    readTime: "7 min read",
    imageUrl: "/images/food-labels.jpg",
  },
];






  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Blog & Articles</h2>
          <p className="section-subtitle">
            Latest insights on hair care and wellness
          </p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.id}>
              {/* ✅ Make image clickable too (optional) */}
              <a
                className="blog-image"
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open article: ${post.title}`}
              >
                <img src={post.imageUrl} alt={post.title} loading="lazy" />
                <span className="blog-category">{post.category}</span>
              </a>

              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>

                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>

                {/* ✅ Replaced button with anchor href */}
                <a
                  className="blog-read-more"
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-cta">
          {/* ✅ View All as href */}
          <a
            className="view-all-btn"
            href="https://pubmed.ncbi.nlm.nih.gov/?term=hair+care"
            target="_blank"
            rel="noopener noreferrer"
          >
            View All Articles
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;
