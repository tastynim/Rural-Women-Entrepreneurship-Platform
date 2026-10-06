import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate, Link } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [language, setLanguage]     = useState('en')
  const [user, setUser]             = useState(null)
  const [selectedImg, setSelectedImg] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMsg, setCartMsg]       = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`)
      setProduct(res.data)
    } catch (err) {
      setError('Product not found or could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    setAddingToCart(true)
    try {
      await axios.post(
        '/api/cart/add',
        { productId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCartMsg(language === 'en' ? 'Added to cart!' : 'কার্টে যোগ হয়েছে!')
      setTimeout(() => setCartMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const canEditDelete = () => {
    if (!user || !product) return false
    return user.role === 'admin' || product.createdBy?._id === user._id
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/products')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product')
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading product…</p>
        </div>
      </div>
    )
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/products"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const name        = product.name?.[language]        || product.name?.en        || ''
  const description = product.description?.[language] || product.description?.en || ''
  const images      = product.images || []

  // ─── Page ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/products" className="hover:text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Products' : 'পণ্যসমূহ'}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-xs">{name}</span>
        </nav>

        {/* Cart toast */}
        {cartMsg && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {cartMsg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ── Left: Image Gallery ───────────────────────────────────── */}
            <div className="p-6 bg-gray-50 flex flex-col gap-4">
              {/* Main image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImg]}
                    alt={name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 p-8">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-3 text-sm">
                      {language === 'en' ? 'No images available' : 'কোনো ছবি নেই'}
                    </p>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                        ${i === selectedImg
                          ? 'border-green-500 shadow-md scale-105'
                          : 'border-gray-200 hover:border-green-300'
                        }`}
                    >
                      <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Info ───────────────────────────────────── */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                {/* Language toggle */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {language === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
                  </button>
                </div>

                {/* Category badge */}
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wide mb-3">
                  {product.category}
                </span>

                {/* Product name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {name}
                </h1>

                {/* Both-language name subtitle */}
                {language === 'en' && product.name?.bn && (
                  <p className="text-lg text-gray-400 mb-4">{product.name.bn}</p>
                )}
                {language === 'bn' && product.name?.en && (
                  <p className="text-lg text-gray-400 mb-4">{product.name.en}</p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-green-600">
                    ৳{product.price?.toLocaleString()}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {language === 'en' ? 'Description' : 'বিবরণ'}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {description}
                  </p>
                </div>

                {/* Seller info */}
                {product.createdBy && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-bold text-lg">
                        {product.createdBy.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        {language === 'en' ? 'Sold by' : 'বিক্রেতা'}
                      </p>
                      <p className="font-semibold text-gray-900">{product.createdBy.name}</p>
                      {product.createdBy.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {product.createdBy.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Action Buttons ─────────────────────────────────────── */}
              <div className="flex flex-col gap-3">

                {/* Add to Cart — customers only */}
                {(!user || user.role === 'customer') && (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-base"
                  >
                    {addingToCart ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {language === 'en' ? 'Adding…' : 'যোগ হচ্ছে…'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {language === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন'}
                      </>
                    )}
                  </button>
                )}

                {/* Go to Cart */}
                {user && (
                  <Link
                    to="/cart"
                    className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-base border border-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {language === 'en' ? 'View Cart' : 'কার্ট দেখুন'}
                  </Link>
                )}

                {/* Edit / Delete — owner or admin */}
                {canEditDelete() && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <Link
                      to={`/products/edit/${product._id}`}
                      className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {language === 'en' ? 'Edit' : 'সম্পাদনা'}
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {language === 'en' ? 'Delete' : 'মুছুন'}
                    </button>
                  </div>
                )}

                {/* Reviews link */}
                <Link
                  to="/reviews"
                  className="text-center text-sm text-green-600 hover:text-green-700 font-medium mt-1"
                >
                  {language === 'en'
                    ? '⭐ See reviews for this product →'
                    : '⭐ এই পণ্যের রিভিউ দেখুন →'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Product meta footer */}
        <div className="mt-4 bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-6 text-sm text-gray-500">
          <span>
            <span className="font-medium text-gray-700">
              {language === 'en' ? 'Product ID:' : 'পণ্য আইডি:'}
            </span>{' '}
            <span className="font-mono">{product._id}</span>
          </span>
          <span>
            <span className="font-medium text-gray-700">
              {language === 'en' ? 'Listed on:' : 'তালিকাভুক্ত:'}
            </span>{' '}
            {new Date(product.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
          {product.updatedAt !== product.createdAt && (
            <span>
              <span className="font-medium text-gray-700">
                {language === 'en' ? 'Last updated:' : 'সর্বশেষ আপডেট:'}
              </span>{' '}
              {new Date(product.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
