import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    productName: '',
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchAllReviews()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products/all')
      setProducts(data)
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  const fetchAllReviews = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/reviews')
      setReviews(data)
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductReviews = async (productName) => {
    try {
      setLoading(true)
      if (!productName) {
        return fetchAllReviews()
      }
      const { data } = await axios.get(`/api/reviews/product/${encodeURIComponent(productName)}`)
      setReviews(data)
    } catch (err) {
      setError('Failed to load reviews for this product')
    } finally {
      setLoading(false)
    }
  }

  const handleProductFilterChange = (e) => {
    const productName = e.target.value
    setSelectedProduct(productName)
    fetchProductReviews(productName)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.productName) {
      setError('Please select a product.')
      return
    }

    try {
      await axios.post('/api/reviews/add', {
        ...formData,
        rating: Number(formData.rating),
      })
      setSuccess('Review submitted successfully!')
      setFormData({ customerName: user?.name || '', productName: '', rating: 5, comment: '' })
      setShowForm(false)
      // Refresh current view
      if (selectedProduct) {
        fetchProductReviews(selectedProduct)
      } else {
        fetchAllReviews()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review')
    }
  }

  const renderStars = (rating) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-emerald-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                  ⭐ Feedback
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Customer{' '}
                <span className="animate-text-shimmer">Reviews</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                See what our customers have to say about our amazing handcrafted products.
              </p>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="mt-6 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg flex items-center justify-center gap-2 btn-glow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {showForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">⭐</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">✨</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">💬</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: avgRating ? `${avgRating}/5` : '–', l: 'Average Rating' },
              { n: reviews.length || '–', l: 'Total Reviews' },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-slate-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Alerts */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl mb-5 animate-slide-down">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-5 flex justify-between animate-slide-down">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-3 hover:text-red-900">✕</button>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 mb-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm">✏️</span>
              Submit Your Review
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                >
                  <option value="">— Choose a product —</option>
                  {products.map((p) => (
                    <option key={p._id} value={p.name?.en || p.name}>
                      {p.name?.en || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Good</option>
                  <option value="3">⭐⭐⭐ Average</option>
                  <option value="2">⭐⭐ Poor</option>
                  <option value="1">⭐ Very Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Review</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 resize-none"
                  placeholder="Share your experience…"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition-all btn-glow"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Filter by Product:</label>
          <div className="flex-1">
            <select
              value={selectedProduct}
              onChange={handleProductFilterChange}
              className="w-full max-w-sm px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p._id} value={p.name?.en || p.name}>
                  {p.name?.en || p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews Display */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-16 text-center animate-fade-in-up">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No reviews found</h3>
              <p className="text-gray-500 text-sm">
                {selectedProduct ? 'No reviews yet for this product.' : 'No reviews yet. Be the first to write one!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <div 
                  key={review._id} 
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden card-tilt flex flex-col group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                          {review.customerName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {review.customerName || 'Anonymous'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                        Product: <span className="text-emerald-700">{review.productName}</span>
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-emerald-200 pl-3">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
