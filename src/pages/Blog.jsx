import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import './Blog.css';

// ====================================================================
// 28 ARTICLES (7 Weeks of Unique Content)
// ====================================================================
export const ALL_BLOGS = [
  // --- WEEK 1: The Basics & Science ---
  {
    id: 1,
    title: "The 100-Banana Strength Secret",
    excerpt: "Discover the science behind our ripened banana powder and how it delivers sustained energy.",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
    date: "Oct 12, 2023",
    readTime: "5 min read",
    author: "Dr. Sarah Wellness",
    category: "Science",
    content: `<h3>The Science of Natural Energy</h3><p>Unlike synthetic energy drinks that cause jitters, banana powder provides a sustained release of glucose. This is due to the unique fiber structure found in ripened Nendran bananas.</p>`
  },
 {
    id: 2,
    title: "First Foods: Banana Powder with milk",
    excerpt: "A gentle, digestible, and nutrient-rich introduction to solids. Why pediatricians recommend it.",
    // UPDATED IMAGE: Mother explicitly feeding baby with a spoon (Very clear "Weaning" action)
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    date: "Oct 15, 2023",
    readTime: "4 min read",
    author: "Mommy & Me",
    category: "Baby Nutrition",
    content: `<h3>Why Start with Banana Powder?</h3><p>The Nendran banana has been a staple in traditional infant nutrition for centuries. It is one of the few foods that is completely non-allergenic and easy on developing stomachs.</p>`
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
    content: `<h3>The Role of Potassium</h3><p>When you sweat, you lose electrolytes. Potassium is the key electrolyte responsible for preventing muscle cramps.</p>`
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
    content: `<h3>1. The Golden Glow</h3><p>Mix 1 scoop of Elvora powder with mango, turmeric, and almond milk.</p>`
  },

  // --- WEEK 2: Recipes & Lifestyle ---
  {
    id: 5,
    title: "Gluten-Free Banana Pancakes",
    excerpt: "Fluffy, delicious, and completely flourless. A breakfast the whole family will love.",
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80",
    date: "Nov 01, 2023",
    readTime: "3 min read",
    author: "Chef Anna",
    category: "Recipes",
    content: `<h3>Ingredients</h3><p>2 eggs, 1 scoop Elvora banana powder, dash of cinnamon. Whisk and fry!</p>`
  },
  {
    id: 6,
    title: "Gut Health 101: Prebiotics",
    excerpt: "How the natural fibers in banana powder feed your good gut bacteria.",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
    date: "Nov 05, 2023",
    readTime: "5 min read",
    author: "Dr. Gutman",
    category: "Health",
    content: `<h3>Feed Your Microbes</h3><p>Banana powder is rich in resistant starch, which acts as a prebiotic, fueling the probiotics in your digestive system.</p>`
  },
  {
    id: 7,
    title: "Vegan Banana Bread Hack",
    excerpt: "Use banana powder to add depth and moisture to your vegan baking without the mess.",
    image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=800&q=80",
    date: "Nov 08, 2023",
    readTime: "4 min read",
    author: "Plant Based Sarah",
    category: "Recipes",
    content: `<h3>The Secret Ingredient</h3><p>Adding banana powder concentrates the flavor and improves the texture of egg-free baking.</p>`
  },
  {
    id: 8,
    title: "Morning Routine for Mental Clarity",
    excerpt: "Start your day with steady energy, not a caffeine crash.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    date: "Nov 12, 2023",
    readTime: "4 min read",
    author: "Mindful Mike",
    category: "Lifestyle",
    content: `<h3>Ditch the Jitters</h3><p>Replacing your second coffee with a banana smoothie keeps your brain sharp without the anxiety.</p>`
  },

  // --- WEEK 3: Sustainability & Origins ---
  {
    id: 9,
    title: "From Kerala with Love",
    excerpt: "Trace the journey of our Nendran bananas from local farms to your kitchen.",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80",
    date: "Nov 15, 2023",
    readTime: "6 min read",
    author: "Elvora Team",
    category: "Sustainability",
    content: `<h3>Sourced Locally</h3><p>We work directly with farmers in Kerala to source the highest quality Nendran bananas.</p>`
  },
  {
    id: 10,
    title: "Why 'Ripe' Matters",
    excerpt: "The nutritional difference between raw plantain flour and our ripened banana powder.",
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
    date: "Nov 18, 2023",
    readTime: "5 min read",
    author: "Dr. Sarah Wellness",
    category: "Science",
    content: `<h3>Sugar vs. Starch</h3><p>As the banana ripens, starches convert into natural sugars, making it sweeter and easier to digest.</p>`
  },
  {
    id: 11,
    title: "Zero Waste Kitchen: Banana Peels?",
    excerpt: "Don't throw them away! Creative ways to use every part of the fruit.",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80",
    date: "Nov 21, 2023",
    readTime: "3 min read",
    author: "Eco Warrior",
    category: "Sustainability",
    content: `<h3>Tea for Plants</h3><p>Soaking banana peels in water creates a potassium-rich fertilizer for your house plants.</p>`
  },
  
    {
    id: 12,
    title: "DIY Banana Face Mask",
    excerpt: "Hydrate your skin naturally with this simple 2-ingredient recipe.",
    // UPDATED IMAGE: Woman applying natural face mask
    image: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80",
    date: "Nov 25, 2023",
    readTime: "2 min read",
    author: "Beauty Insider",
    category: "Lifestyle",
    content: `<h3>Glow Up</h3><p>Mix banana powder with honey for a soothing, hydrating face mask.</p>`
  },

  // --- WEEK 4: Fitness Focus ---
  {
    id: 13,
    title: "Marathon Prep: Natural Fuel",
    excerpt: "Why long-distance runners are switching from gels to banana powder.",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80",
    date: "Dec 01, 2023",
    readTime: "5 min read",
    author: "Run Club",
    category: "Fitness",
    content: `<h3>Easy Digestion</h3><p>Gels can cause stomach upset. Banana powder is gentle and provides the same carbohydrate boost.</p>`
  },
  {
    id: 14,
    title: "Muscle Cramps Explained",
    excerpt: "The science of electrolyte imbalance and how to fix it instantly.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    date: "Dec 03, 2023",
    readTime: "4 min read",
    author: "Dr. Physio",
    category: "Science",
    content: `<h3>The Potassium Gap</h3><p>Most people are deficient in potassium. A single serving of Elvora bridges that gap.</p>`
  },
  {
    id: 15,
    title: "Protein Shake Upgrade",
    excerpt: "Stop drinking chalky shakes. Add creaminess and flavor naturally.",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80",
    date: "Dec 07, 2023",
    readTime: "3 min read",
    author: "Gym Rat",
    category: "Recipes",
    content: `<h3>Texture Hack</h3><p>Banana powder acts as a thickener, giving your protein shake a milkshake-like consistency.</p>`
  },
  {
    id: 16,
    title: "Yoga & Breakfast",
    excerpt: "Light meals that won't weigh you down during your practice.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    date: "Dec 10, 2023",
    readTime: "4 min read",
    author: "Yogi Jen",
    category: "Lifestyle",
    content: `<h3>Light & Energetic</h3><p>A small banana smoothie provides energy for your flow without the heaviness of a full breakfast.</p>`
  },

  // --- WEEK 5: Family & Kids ---
  {
    id: 17,
    title: "Sneaky Nutrition for Picky Eaters",
    excerpt: "How to hide vitamins in your kids' favorite treats using banana powder.",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
    date: "Dec 15, 2023",
    readTime: "5 min read",
    author: "Super Mom",
    category: "Baby Nutrition",
    content: `<h3>The Invisible Vitamin</h3><p>Add a scoop to brownie mix or cookie dough. They won't taste it, but they'll get the nutrients.</p>`
  },
  {
    id: 18,
    title: "The Ultimate After-School Snack",
    excerpt: "Energy balls recipe that takes 5 minutes to make.",
    // UPDATED IMAGE: School-age girl drinking a healthy smoothie
    image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=800&q=80",
    date: "Dec 18, 2023",
    readTime: "3 min read",
    author: "Chef Anna",
    category: "Recipes",
    content: `<h3>No-Bake Energy</h3><p>Oats, honey, peanut butter, and banana powder. Roll into balls and refrigerate.</p>`
  },
  
  {
    id: 19,
    title: "Baby Weaning: Stage 1",
    excerpt: "A step-by-step guide to introducing solids with banana porridge.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
    date: "Dec 20, 2023",
    readTime: "6 min read",
    author: "Pediatrician Jane",
    category: "Baby Nutrition",
    content: `<h3>Consistency Matters</h3><p>Start with a very thin porridge mixed with breast milk or formula.</p>`
  },
  {
    id: 20,
    title: "Family Weekend Brunch",
    excerpt: "Banana waffles that are crispy on the outside and soft on the inside.",
    image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80",
    date: "Dec 25, 2023",
    readTime: "4 min read",
    author: "Chef Dad",
    category: "Recipes",
    content: `<h3>Sunday Special</h3><p>Our waffle mix uses 50% less sugar by relying on the natural sweetness of banana powder.</p>`
  },

  // --- WEEK 6: Health Conditions ---
  {
    id: 21,
    title: "Managing Blood Sugar Naturally",
    excerpt: "Why low-GI foods like green/ripened banana blends are better for diabetics.",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
    date: "Jan 02, 2024",
    readTime: "6 min read",
    author: "Dr. Health",
    category: "Health",
    content: `<h3>Glycemic Index</h3><p>Banana powder releases energy slowly, preventing the dangerous spikes associated with processed sugar.</p>`
  },
  {
    id: 22,
    title: "Blood Pressure & Diet",
    excerpt: "The critical link between sodium, potassium, and heart health.",
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80",
    date: "Jan 05, 2024",
    readTime: "5 min read",
    author: "Cardio Care",
    category: "Science",
    content: `<h3>Balance is Key</h3><p>We eat too much salt and not enough potassium. This imbalance stresses the heart.</p>`
  },
  {
    id: 23,
    title: "Gluten Sensitivity? Read This.",
    excerpt: "Banana flour is the perfect gluten-free thickener for soups and sauces.",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80",
    date: "Jan 08, 2024",
    readTime: "3 min read",
    author: "GF Living",
    category: "Recipes",
    content: `<h3>Thicken Naturally</h3><p>Use it exactly like cornstarch. Whisk into cold water before adding to hot liquids.</p>`
  },
  {
    id: 24,
    title: "Senior Health: Bone Density",
    excerpt: "Potassium also plays a role in retaining calcium for stronger bones.",
    image: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80",
    date: "Jan 12, 2024",
    readTime: "4 min read",
    author: "Geriatric Care",
    category: "Health",
    content: `<h3>Not Just Milk</h3><p>Calcium needs magnesium and potassium to be properly absorbed by the bones.</p>`
  },

  // --- WEEK 7: Sweet Treats ---
  {
    id: 25,
    title: "No-Churn Banana Ice Cream",
    excerpt: "A creamy, frozen dessert with only one main ingredient.",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80",
    date: "Jan 15, 2024",
    readTime: "3 min read",
    author: "Chef Anna",
    category: "Recipes",
    content: `<h3>Nice Cream</h3><p>Blend frozen bananas with a scoop of Elvora powder for extra intensity. No dairy needed.</p>`
  },
  {
    id: 26,
    title: "Banana Mocha Latte",
    excerpt: "Save money and calories by making this cafe favorite at home.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
    date: "Jan 18, 2024",
    readTime: "2 min read",
    author: "Barista Bob",
    category: "Recipes",
    content: `<h3>Shake and Pour</h3><p>Add powder to your espresso shot before pouring in the milk for a smooth blend.</p>`
  },
  {
    id: 27,
    title: "Tropical Chia Pudding",
    excerpt: "Meal prep your breakfast for the whole week with this jar recipe.",
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=800&q=80",
    date: "Jan 22, 2024",
    readTime: "3 min read",
    author: "Meal Prep Pro",
    category: "Recipes",
    content: `<h3>Set it and Forget it</h3><p>Chia seeds, coconut milk, and banana powder. Leave in fridge overnight.</p>`
  },
  {
    id: 28,
    title: "The Ultimate Smoothie Bowl",
    excerpt: "How to get that thick, spoonable texture every time.",
    image: "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=800&q=80",
    date: "Jan 25, 2024",
    readTime: "4 min read",
    author: "Insta Foodie",
    category: "Lifestyle",
    content: `<h3>Less Liquid</h3><p>The key to a thick bowl is using frozen fruit and minimal liquid, boosted by the thickening power of banana powder.</p>`
  }
];

export default function Blog() {
  // --- WEEKLY ROTATION LOGIC ---
  const visibleBlogs = useMemo(() => {
    // 1. Set a fixed start date (e.g., Jan 1, 2023)
    const startDate = new Date("2023-01-01").getTime();
    const now = new Date().getTime();

    // 2. Calculate how many weeks have passed
    const oneWeekInMillis = 1000 * 60 * 60 * 24 * 7;
    const weeksPassed = Math.floor((now - startDate) / oneWeekInMillis);

    // 3. There are 28 blogs, so 7 sets of 4.
    // Use modulo operator (%) to cycle 0 -> 1 -> 2 ... -> 6 -> 0
    const totalSets = Math.floor(ALL_BLOGS.length / 4); // 7 sets
    const currentSetIndex = weeksPassed % totalSets;

    // 4. Calculate start index for slice (0, 4, 8, etc.)
    const startIndex = currentSetIndex * 4;

    // 5. Return the 4 blogs for this week
    return ALL_BLOGS.slice(startIndex, startIndex + 4);
  }, []);

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
        <Link to="/blog/all" className="view-all-btn">
          View All Articles
        </Link>
      </div>
    </div>
  );
}