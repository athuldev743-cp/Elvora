// src/components/admin/UpdateProduct.jsx
import { useEffect, useMemo, useState } from "react";
import "./UpdateProduct.css";

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
      image2_url: product?.image2_url || "",
    };
  }, [product]);

  const [form, setForm] = useState(initial);

  // Primary Image
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url || "");

  // Second Image
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

  const onPickImage2 = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage2File(file);
    setPreview2(URL.createObjectURL(file));
  };

  // ✅ Hero toggle state
  const isHero = Number(form.priority ?? 2) === 1;

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.price || isNaN(Number(form.price))) return "Valid price is required";
    if (!form.description.trim()) return "Description is required";
    if (form.quantity === "" || isNaN(Number(form.quantity))) return "Valid quantity is required";
    if (form.priority === "" || isNaN(Number(form.priority))) return "Valid priority is required";

    // ✅ Same logic implication: if hero is ON but no banner exists and none selected, block save
    // (This mirrors your "required when visible" idea from AddProduct)
    if (Number(form.priority) === 1 && !preview2 && !image2File) {
      return "Hero Banner image is required for Priority 1";
    }

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
        image2File: image2File || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="updateWrap">
      <div className="updateGrid">
        {/* PREVIEW COLUMN */}
        <div className="previewColumn">
          {/* Main Image Preview */}
          <div className="updatePreviewCard">
            <div className="updatePreviewTitle">Main Image</div>

            <div className="updatePreviewImage">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className="noImage">No Image</div>
              )}
            </div>

            <label className="fileBtn">
              Change Main Image
              <input type="file" accept="image/*" onChange={onPickImage} />
            </label>

            <div className="previewMeta">
              <div className="previewName">{form.name || "Product name"}</div>
            </div>
          </div>

          {/* Hero Banner Preview (Only if Hero ON / Priority 1) */}
          {isHero && (
            <div className="updatePreviewCard" style={{ marginTop: 20 }}>
              <div className="updatePreviewTitle">Hero Banner (Priority 1)</div>

              <div className="updatePreviewImage">
                {preview2 ? (
                  <img src={preview2} alt="Hero Preview" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="noImage">No Banner</div>
                )}
              </div>

              <label className="fileBtn">
                Change Banner
                <input type="file" accept="image/*" onChange={onPickImage2} />
              </label>
            </div>
          )}
        </div>

        {/* FORM COLUMN */}
        <form className="updateFormCard" onSubmit={submit}>
          <div className="formTitle">Update Product</div>

          <div className="formRow">
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={onChange("name")} placeholder="Product name" />
            </div>

            <div className="field">
              <label>Price</label>
              <input value={form.price} onChange={onChange("price")} placeholder="e.g. 199" />
            </div>
          </div>

          <div className="formRow">
            <div className="field">
              <label>Quantity</label>
              <input value={form.quantity} onChange={onChange("quantity")} placeholder="e.g. 0" />
              <small>Quantity ≤ 0 will show “Available Soon” on Home.</small>
            </div>

            {/* ✅ REPLACED: Priority input -> Hero toggle */}
            <div className="field">
              <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span>Hero Product (Priority 1)</span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isHero}
                    onChange={(e) => {
                      const on = e.target.checked;

                      // ✅ Same rule:
                      // ON -> priority 1
                      // OFF -> priority 2 + clear banner file + preview
                      setForm((p) => ({ ...p, priority: on ? "1" : "2" }));

                      if (!on) {
                        setImage2File(null);
                        setPreview2("");
                      }
                    }}
                  />
                  <span className="slider" />
                </label>
              </label>

              <small>Turn ON to enable Hero Banner image.</small>
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={onChange("description")}
              rows={6}
              placeholder="Write product description..."
            />
          </div>

          <div className="formActions">
            <button type="button" className="secondaryBtn" onClick={onCancel} disabled={saving}>
              Cancel
            </button>

            <button type="submit" className="primaryBtn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}