import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name_en: "",
    name_bn: "",
    description_en: "",
    description_bn: "",
    price: "",
    category: "",
  });
  const [images, setImages] = useState([]); // array of /uploads/filename URLs
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const p = response.data;
      setFormData({
        name_en: p.name?.en || "",
        name_bn: p.name?.bn || "",
        description_en: p.description?.en || "",
        description_bn: p.description?.bn || "",
        price: p.price || "",
        category: p.category || "",
      });
      setImages(p.images || []);
    } catch (err) {
      setError("Failed to load product details.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Image Upload ────────────────────────────────────────────────────────────
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Each image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setUploadingImage(true);

    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("image", file);

    try {
      const response = await axios.post("/api/products/upload", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setImages((prev) => [...prev, response.data.imageUrl]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to upload image. Please try again.",
      );
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const productData = {
      name: { en: formData.name_en, bn: formData.name_bn },
      description: { en: formData.description_en, bn: formData.description_bn },
      price: Number(formData.price),
      category: formData.category,
      images,
    };

    try {
      if (isEdit) {
        await axios.put(`/api/products/${id}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/products/add", productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate("/products");
    } catch (err) {
      setError(
        err.response?.data?.message || "Operation failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-emerald-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                  {isEdit ? "✏️ Edit Mode" : "➕ New Product"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                {isEdit ? "Update " : "Add "}
                <span className="animate-text-shimmer">{isEdit ? "Product" : "New Product"}</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                {isEdit 
                  ? "Update product details to keep your listings fresh and accurate." 
                  : "List a new handcrafted product to showcase in your store."}
              </p>
            </div>
            
            <div className="animate-float hidden md:block">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="w-40 h-40 glass-dark rounded-3xl flex flex-col items-center justify-center relative hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">🔙</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">🛒</div>
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-bold text-sm">Cancel & Return</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex justify-between items-center animate-slide-down shadow-sm">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-4 font-bold hover:text-red-900 bg-red-100 p-1.5 rounded-lg"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Product Names ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shadow-inner">
                1
              </span>
              Product Name
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_en"
                  required
                  value={formData.name_en}
                  onChange={handleChange}
                  placeholder="e.g. Handwoven Basket"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_bn"
                  required
                  value={formData.name_bn}
                  onChange={handleChange}
                  placeholder="যেমন: হাতে বোনা ঝুড়ি"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* ── Descriptions ────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Description
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description_en"
                  required
                  value={formData.description_en}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your product in English…"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (বাংলা) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description_bn"
                  required
                  value={formData.description_bn}
                  onChange={handleChange}
                  rows={4}
                  placeholder="বাংলায় পণ্যের বিবরণ দিন…"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Price & Category ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                3
              </span>
              Price & Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (৳) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. handicraft, textile, food"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Common: handicraft, textile, food, pottery, jewelry, clothing
                </p>
              </div>
            </div>
          </div>

          {/* ── Image Upload ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                4
              </span>
              Product Images
              <span className="text-xs font-normal text-gray-400 ml-1">
                (optional)
              </span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Upload up to 5 images. Accepted: JPG, PNG, WEBP · Max 5 MB each.
            </p>

            {/* Hidden file input */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border-2 border-gray-200 aspect-square"
                  >
                    <img
                      src={img}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Remove overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700"
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    {/* Primary badge */}
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded font-medium">
                        Main
                      </span>
                    )}
                  </div>
                ))}

                {/* Add more slot */}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 flex flex-col items-center justify-center text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? (
                      <svg
                        className="animate-spin w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6 mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="text-xs">Add</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Upload button — shown when no images yet */}
            {images.length === 0 && (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 flex flex-col items-center justify-center text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? (
                  <>
                    <svg
                      className="animate-spin w-8 h-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Uploading…</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-10 h-10 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Click to upload images
                    </span>
                    <span className="text-xs mt-1">
                      JPG, PNG, WEBP up to 5 MB
                    </span>
                  </>
                )}
              </button>
            )}

            {images.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {images.length}/5 images uploaded · The first image will be
                shown as the main photo.
              </p>
            )}
          </div>

          {/* ── Submit Buttons ────────────────────────────────────────────── */}
          <div className="flex gap-4 pt-6 mt-8 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 py-4 px-6 btn-glow bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  {isEdit ? "Saving Changes…" : "Adding Product…"}
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isEdit ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-8 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:text-slate-900 hover:border-slate-300 hover:bg-white shadow-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
