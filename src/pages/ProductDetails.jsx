import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductById } from "../api/publicAPI";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) return <p style={{ padding: 40 }}>Loading product...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;
  if (!product) return <p style={{ padding: 40 }}>Product not found</p>;

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1>{product.name}</h1>
      <img
        src={product.image_url}
        alt={product.name}
        style={{ width: "100%", maxWidth: 400, borderRadius: 8 }}
      />
      <p style={{ marginTop: 20 }}>{product.description}</p>
      <h3>₹{product.price}</h3>

      <button
        className="primary-btn"
        onClick={() => navigate(`/order/${product.id}`)}
        style={{ marginTop: 20 }}
      >
        Buy Now
      </button>
    </div>
  );
}

export default ProductDetails;
