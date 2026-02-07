// src/components/admin/AddProduct.jsx
import "./AddProduct.css";

function AddProduct({
  showAddForm,
  setShowAddForm,
  newProduct,
  setNewProduct,
  handleAddProduct,
  setError,
}) {
  if (!showAddForm) return null;

  const update = (patch) => setNewProduct({ ...newProduct, ...patch });

  // Check if Priority is 1
  const isPriorityOne = parseInt(newProduct.priority || "2", 10) === 1;

  return (
    <div className="addFormContainer">
      <h3>Add New Product</h3>

      <form onSubmit={handleAddProduct}>
        <div className="formGroup">
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={newProduct.name || ""}
            onChange={(e) => update({ name: e.target.value })}
            required
          />
        </div>

        <div className="formGroup">
          <label>Price (₹) *</label>
          <input
            type="number"
            name="price"
            placeholder="Enter price"
            value={newProduct.price ?? ""}
            onChange={(e) => update({ price: e.target.value })}
            required
            min="1"
            step="0.01"
          />
        </div>

        <div className="formGroup">
          <label>Description *</label>
          <textarea
            name="description"
            placeholder="Enter product description"
            value={newProduct.description || ""}
            onChange={(e) => update({ description: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="grid2">
          <div className="formGroup">
            <label>Priority (1 = highest) *</label>
            <input
              type="number"
              name="priority"
              placeholder="Enter priority"
              value={newProduct.priority ?? "1"}
              onChange={(e) => update({ priority: e.target.value })}
              required
              min="1"
              step="1"
            />
          </div>

          <div className="formGroup">
            <label>Quantity *</label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity (0 = Available Soon)"
              value={newProduct.quantity ?? "0"}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") return update({ quantity: "" });
                const n = Math.max(0, parseInt(v, 10) || 0);
                update({ quantity: String(n) });
              }}
              required
              min="0"
              step="1"
            />
            <small>Set 0 if product is not available now.</small>
          </div>
        </div>

        {/* MAIN IMAGE */}
        <div className="formGroup">
          <label>Product Image (Main) *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                update({ image: e.target.files[0] });
              }
            }}
            required={!newProduct.image} // Required if not already set
          />
          <small>Select a product image (JPEG, PNG, etc.)</small>

          {newProduct.image && (
            <div className="filePreview">Selected: {newProduct.image.name}</div>
          )}
        </div>

        {/* ✅ NEW: HERO IMAGE (Priority 1 Only) */}
        {isPriorityOne && (
          <div className="formGroup" style={{background: '#f9f9f9', padding: 15, borderRadius: 8}}>
            <label>Hero Banner Image (Priority 1) *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  update({ image2: e.target.files[0] });
                }
              }}
              required={!newProduct.image2} // Required if priority=1
            />
            <small>Upload a wide banner image for the hero section.</small>
            {newProduct.image2 && (
              <div className="filePreview">Selected: {newProduct.image2.name}</div>
            )}
          </div>
        )}

        <div className="formButtons">
          <button type="submit" className="submitBtn">
            Add Product
          </button>

          <button
            type="button"
            className="cancelBtn"
            onClick={() => {
              setShowAddForm(false);
              setError("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;