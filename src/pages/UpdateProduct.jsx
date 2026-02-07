// src/components/admin/UpdateProduct.jsx
import { useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.css";

export default function UpdateProduct({ product, onCancel, onSubmit, setError }) {
  const initial = useMemo(() => {
    return {
      id: product?.id,
      name: product?.name || "",
      price: String(product?.price ?? ""),
      description: product?.description || "",
      priority: String(product?.priority ?? "2"),
      quantity: String(product?.quantity ?? "0"),
      image_url: product?.image_url || "",
      image2_url: product?.image2_url || "", // ✅ NEW: Load existing second image
    };
  }, [product]);

  const [form, setForm] = useState(initial);
  
  // Primary Image
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url || "");
  
  // ✅ NEW: Second Image
  const [image2File, setImage2File] = useState(null);
  const [preview2, setPreview2] = useState(product?.image2_url || "");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
    setImageFile(null);
    setImage2File(null);
    setPreview(product?.image_url || "");
    setPreview2(product?.image2_url || "");
  }, [initial, product]);

  const onChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ NEW: Pick Second Image
  const onPickImage2 = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage2File(file);
    setPreview2(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.price || isNaN(Number(form.price))) return "Valid price is required";
    if (!form.description.trim()) return "Description is required";
    if (form.quantity === "" || isNaN(Number(form.quantity))) return "Valid quantity is required";
    if (form.priority === "" || isNaN(Number(form.priority))) return "Valid priority is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    setSaving(true);
    try {
      await onSubmit({
        id: form.id,
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        priority: Number(form.priority),
        quantity: Number(form.quantity),
        imageFile: imageFile || null,
        image2File: image2File || null, // ✅ NEW: Send second image
      });
    } finally {
      setSaving(false);
    }
  };

  const isPriorityOne = parseInt(form.priority || "2", 10) === 1;

  return (
    <div className={styles.updateWrap}>
      <div className={styles.updateGrid}>
        
        {/* PREVIEW COLUMN */}
        <div className={styles.previewColumn}>
          
          {/* Main Image Preview */}
          <div className={styles.updatePreviewCard}>
            <div className={styles.updatePreviewTitle}>Main Image</div>
            <div className={styles.updatePreviewImage}>
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
            </div>
            <label className={styles.fileBtn}>
              Change Main Image
              <input type="file" accept="image/*" onChange={onPickImage} />
            </label>
            <div className={styles.previewMeta}>
              <div className={styles.previewName}>{form.name || "Product name"}</div>
            </div>
          </div>

          {/* ✅ NEW: Hero Image Preview (Only if Priority 1) */}
          {isPriorityOne && (
            <div className={styles.updatePreviewCard} style={{ marginTop: 20 }}>
              <div className={styles.updatePreviewTitle}>Hero Banner (Priority 1)</div>
              <div className={styles.updatePreviewImage}>
                {preview2 ? (
                  <img src={preview2} alt="Hero Preview" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.noImage}>No Banner</div>
                )}
              </div>
              <label className={styles.fileBtn}>
                Change Banner
                <input type="file" accept="image/*" onChange={onPickImage2} />
              </label>
            </div>
          )}

        </div>

        {/* FORM COLUMN */}
        <form className={styles.updateFormCard} onSubmit={submit}>
          <div className={styles.formTitle}>Update Product</div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Name</label>
              <input value={form.name} onChange={onChange("name")} placeholder="Product name" />
            </div>

            <div className={styles.field}>
              <label>Price</label>
              <input value={form.price} onChange={onChange("price")} placeholder="e.g. 199" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Quantity</label>
              <input value={form.quantity} onChange={onChange("quantity")} placeholder="e.g. 0" />
              <small>Quantity ≤ 0 will show “Available Soon” on Home.</small>
            </div>

            <div className={styles.field}>
              <label>Priority</label>
              <input value={form.priority} onChange={onChange("priority")} placeholder="e.g. 1" />
              <small>Set to 1 to enable Hero Banner image.</small>
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={onChange("description")}
              rows={6}
              placeholder="Write product description..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={saving}>
              Cancel
            </button>

            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}