import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function Products() {
  const navigate = useNavigate();
  const { lang: language } = useLang();


  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get("/api/products/all");
      const data = response.data;
      setProducts(data);
      setDisplayProducts(data);
      // Extract unique categories
      const cats = [
        ...new Set(data.map((p) => p.category).filter(Boolean)),
      ].sort();
      setCategories(cats);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ── Search / filter whenever any filter value changes ──────────────────────
  useEffect(() => {
    const hasFilters = searchTerm.trim() || selectedCategory || sortBy;
    if (!hasFilters) {
      setDisplayProducts(products);
      return;
    }
    performSearch();
  }, [searchTerm, selectedCategory, sortBy, products]);

  const performSearch = useCallback(async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (selectedCategory) params.append("category", selectedCategory);
      if (sortBy) params.append("sort", sortBy);

      const response = await axios.get(`/api/products/search?${params}`);
      setDisplayProducts(response.data.products);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [searchTerm, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("");
    setDisplayProducts(products);
  };

  const hasActiveFilters = searchTerm || selectedCategory || sortBy;

  // ── Cart ────────────────────────────────────────────────────────────────────
  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setAddingToCart(productId);
    try {
      await axios.post(
        "/api/cart/add",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCartMessage(
        language === "en" ? "Item added to cart!" : "কার্টে যোগ হয়েছে!",
      );
      setTimeout(() => setCartMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      setDisplayProducts(displayProducts.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const canEditDelete = (product) => {
    if (!user) return false;
    return user.role === "admin" || product.createdBy?._id === user._id;
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading products…</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-emerald-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                  {language === "en" ? "🌿 Marketplace" : "🌿 মার্কেটপ্লেস"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                {language === "en" ? "Products & " : "পণ্য ও "}
                <span className="animate-text-shimmer">{language === "en" ? "Services" : "সেবা"}</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                {language === "en"
                  ? "Discover handcrafted products from rural women entrepreneurs across Bangladesh."
                  : "বাংলাদেশের গ্রামীণ নারী উদ্যোক্তাদের হাতের তৈরি পণ্য আবিষ্কার করুন।"}
              </p>

              <div className="flex gap-3 mt-6">
                <Link to="/cart" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 backdrop-blur-sm shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {language === "en" ? "Cart" : "কার্ট"}
                </Link>
                {(user?.role === "entrepreneur" || user?.role === "admin") && (
                  <Link to="/products/add" className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg btn-glow">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {language === "en" ? "Add Product" : "পণ্য যোগ করুন"}
                  </Link>
                )}
              </div>
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">🛍️</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">✨</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">🌿</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: products.length || '–', l: language === "en" ? "Products" : "পণ্য" },
              { n: categories.length || '–', l: language === "en" ? "Categories" : "বিভাগ" },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-slate-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Search & Filter Bar ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search input */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                {language === "en" ? "Search" : "অনুসন্ধান"}
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    language === "en" ? "Search by name…" : "নাম দিয়ে খুঁজুন…"
                  }
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category filter */}
            <div className="min-w-[160px]">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                {language === "en" ? "Category" : "বিভাগ"}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">
                  {language === "en" ? "All Categories" : "সব বিভাগ"}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="min-w-[170px]">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                {language === "en" ? "Sort By" : "সাজান"}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">
                  {language === "en" ? "Default" : "ডিফল্ট"}
                </option>
                <option value="price">
                  {language === "en" ? "Price: Low → High" : "মূল্য: কম → বেশি"}
                </option>
                <option value="-price">
                  {language === "en" ? "Price: High → Low" : "মূল্য: বেশি → কম"}
                </option>
                <option value="-createdAt">
                  {language === "en" ? "Newest First" : "নতুন প্রথমে"}
                </option>
                <option value="createdAt">
                  {language === "en" ? "Oldest First" : "পুরনো প্রথমে"}
                </option>
              </select>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium flex items-center gap-1.5 transition-colors self-end"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {language === "en" ? "Clear Filters" : "ফিল্টার সরান"}
              </button>
            )}
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium self-center">
                {language === "en" ? "Active filters:" : "সক্রিয় ফিল্টার:"}
              </span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {sortBy.startsWith("-")
                    ? sortBy.replace("-", "") + " ↓"
                    : sortBy + " ↑"}
                  <button
                    onClick={() => setSortBy("")}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {searching ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4 text-green-600"
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
                {language === "en" ? "Searching…" : "অনুসন্ধান চলছে…"}
              </span>
            ) : (
              <>
                <span className="font-semibold text-gray-900">
                  {displayProducts.length}
                </span>{" "}
                {language === "en"
                  ? `product${displayProducts.length !== 1 ? "s" : ""} found`
                  : "টি পণ্য পাওয়া গেছে"}
              </>
            )}
          </p>
        </div>

        {/* ── Cart toast ───────────────────────────────────────────────── */}
        {cartMessage && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
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
            {cartMessage}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold">
              ✕
            </button>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!searching && displayProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">
              {hasActiveFilters
                ? language === "en"
                  ? "No products match your search."
                  : "কোনো পণ্য পাওয়া যায়নি।"
                : language === "en"
                  ? "No products available yet."
                  : "এখনো কোনো পণ্য নেই।"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-3 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                {language === "en" ? "Clear Filters" : "ফিল্টার সরান"}
              </button>
            )}
          </div>
        ) : (
          /* ── Product Grid ─────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, idx) => {
              const productName = product.name?.[language] || product.name?.en || "";
              const productDesc = product.description?.[language] || product.description?.en || "";
              const firstImage = product.images?.[0] || null;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col group card-tilt animate-fade-in-up"
                  style={{ animationDelay: `${(idx % 9) * 60}ms` }}
                >
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  {/* Image */}
                  <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-green-200">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="text-xs mt-1 text-green-300">{language === "en" ? "No image" : "ছবি নেই"}</span>
                        </div>
                      )}
                    </div>
                    {/* Category ribbon */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-600/90 text-white text-xs rounded-full font-semibold backdrop-blur-sm shadow-sm">
                      {product.category}
                    </span>
                  </Link>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-base font-bold text-gray-900 mb-1 hover:text-green-700 transition-colors line-clamp-1 group-hover:text-green-700">
                          {productName}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{productDesc}</p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-extrabold text-green-600">৳{product.price?.toLocaleString()}</span>
                        {product.createdBy?.name && (
                          <span className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[110px]">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold flex-shrink-0">
                              {product.createdBy.name.charAt(0).toUpperCase()}
                            </div>
                            {product.createdBy.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="w-full py-2.5 px-4 border-2 border-green-500 text-green-700 rounded-xl hover:bg-green-500 hover:text-white text-sm font-semibold text-center transition-all duration-200 flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {language === "en" ? "View Details" : "বিস্তারিত দেখুন"}
                      </Link>

                      {(!user || user.role === "customer") && (
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={addingToCart === product._id}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm btn-glow"
                        >
                          {addingToCart === product._id ? (
                            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>{language === "en" ? "Adding…" : "যোগ হচ্ছে…"}</>
                          ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>{language === "en" ? "Add to Cart" : "কার্টে যোগ করুন"}</>
                          )}
                        </button>
                      )}

                      {user && canEditDelete(product) && (
                        <div className="flex gap-2">
                          <Link to={`/products/edit/${product._id}`} className="flex-1 text-center py-2 px-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-semibold transition-colors">
                            {language === "en" ? "Edit" : "সম্পাদনা"}
                          </Link>
                          <button onClick={() => handleDelete(product._id)} className="flex-1 py-2 px-3 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-semibold transition-colors">
                            {language === "en" ? "Delete" : "মুছুন"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
