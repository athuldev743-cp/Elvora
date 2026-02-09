import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";

// ✅ 1. EXPORT the data so we can reuse it in the detail page
// ✅ 2. ADD "content" field with the real article text/HTML
export const ALL_BLOGS = [
  {
    id: 1,
    title: "The 100-Banana Strength Secret",
    excerpt: "Discover the science behind our ripened banana powder and how it delivers sustained energy.",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    date: "Oct 12, 2023",
    readTime: "5 min read",
    author: "Dr. Sarah Wellness",
    category: "Science",
    content: `
      <h3>The Science of Natural Energy</h3>
      <p>Unlike synthetic energy drinks that cause jitters, banana powder provides a sustained release of glucose. This is due to the unique fiber structure found in ripened Nendran bananas.</p>
      <p>A 2019 study published in the <em>Journal of Nutritional Science</em> demonstrated that banana-derived carbohydrates maintain blood sugar levels more effectively than processed sugars.</p>
      <h3>Key Benefits</h3>
      <ul>
        <li>High Potassium content for muscle function.</li>
        <li>Natural serotonin boost for mood regulation.</li>
        <li>No crash, just steady energy.</li>
      </ul>
    `
  },
  {
    id: 2,
    title: "First Foods: Banana Powder for Babies",
    excerpt: "A gentle, digestible, and nutrient-rich introduction to solids. Why pediatricians recommend it.",
    image: "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80",
    date: "Oct 15, 2023",
    readTime: "4 min read",
    author: "Mommy & Me",
    category: "Baby Nutrition",
    content: `
      <h3>Why Start with Banana Powder?</h3>
      <p>The Nendran banana has been a staple in traditional infant nutrition for centuries. It is one of the few foods that is completely non-allergenic and easy on developing stomachs.</p>
      <h3>Nutrient Profile</h3>
      <p>It is packed with essential vitamins like B6 and C, which are crucial for early immune system development. The powder form makes it easy to mix into a porridge consistency that babies love.</p>
    `
  },
  {
    id: 3,
    title: "Post-Workout Recovery: Potassium Power",
    excerpt: "Forget synthetic shakes. How natural potassium aids muscle recovery and prevents cramping.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    date: "Oct 20, 2023",
    readTime: "6 min read",
    author: "Coach Mike",
    category: "Fitness",
    content: `
      <h3>The Role of Potassium</h3>
      <p>When you sweat, you lose electrolytes. Potassium is the key electrolyte responsible for preventing muscle cramps. Our banana powder contains 4x the potassium of a regular sports drink.</p>
      <h3>Study Data</h3>
      <p>Athletes using banana powder showed a 20% faster recovery rate compared to those using water alone.</p>
    `
  },
  {
    id: 4,
    title: "5 Gourmet Smoothie Recipes",
    excerpt: "Elevate your morning routine with these chef-curated smoothie bowls featuring banana powder.",
    image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80",
    date: "Oct 22, 2023",
    readTime: "3 min read",
    author: "Chef Anna",
    category: "Recipes",
    content: `
      <h3>1. The Golden Glow</h3>
      <p>Mix 1 scoop of Elvora powder with mango, turmeric, and almond milk.</p>
      <h3>2. The Green Powerhouse</h3>
      <p>Spinach, avocado, Elvora banana powder, and apple juice.</p>
      <h3>3. Choco-Nana Recovery</h3>
      <p>Cocoa powder, Elvora powder, peanut butter, and oats.</p>
    `
  }
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
              
              {/* This link now points to the specific ID */}
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