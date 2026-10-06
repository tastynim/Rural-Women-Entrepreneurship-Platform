import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data)
    } catch (err) {
      setError('Failed to load cart. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (productId) => {
    setRemovingId(productId)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data)
    } catch (err) {
      setError('Failed to remove item. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return
    setClearing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart({ products: [], totalPrice: 0 })
    } catch (err) {
      setError('Failed to clear cart. Please try again.')
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 drop-shadow-md" />
          <p className="text-slate-600 font-bold animate-pulse">Loading your cart...</p>
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.products.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 pb-16">
      
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-800 text-white overflow-hidden mb-10">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-emerald-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                  🛒 Shopping Cart
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                  {cart?.products?.length || 0} Items
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Your <span className="animate-text-shimmer">Cart</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                Review your selected items before proceeding to checkout. Ensure everything is perfect.
              </p>
            </div>
            
            <div className="animate-float hidden md:block">
              <button
                onClick={() => navigate('/products')}
                className="w-32 h-32 glass-dark rounded-3xl flex flex-col items-center justify-center relative hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">🏪</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">✨</div>
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-bold text-xs uppercase tracking-wider text-center px-2">Keep Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3 animate-slide-down shadow-sm">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Empty Cart */}
        {isEmpty ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added any products to your cart yet. Discover items you'll love!</p>
            <Link
              to="/products"
              className="btn-glow inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">🛍️</span>
                    Shopping List
                  </h2>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold shadow-inner">
                    {cart.products.length} {cart.products.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.products.map((item, index) => {
                    const product = item.product
                    const subtotal = (product?.price || 0) * item.quantity

                    return (
                      <div key={item._id} className="p-8 flex flex-col sm:flex-row sm:items-center gap-6 group hover:bg-slate-50/50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Product Icon Placeholder */}
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white group-hover:scale-105 transition-transform duration-300">
                          <svg className="w-10 h-10 text-teal-600 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg text-slate-800 truncate mb-1">
                            {product?.name?.en || 'Unknown Product'}
                          </p>
                          <p className="text-sm font-medium text-emerald-600/80 uppercase tracking-widest">{product?.category}</p>
                          <p className="text-slate-500 mt-2 font-medium">
                            Unit price: <span className="text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">৳{product?.price?.toLocaleString()}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-8 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                          {/* Quantity */}
                          <div className="text-center flex-shrink-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Qty</p>
                            <span className="inline-block w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center font-black text-slate-700 text-lg">
                              {item.quantity}
                            </span>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right flex-shrink-0 min-w-[100px]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subtotal</p>
                            <p className="font-black text-xl text-emerald-600 tracking-tight">৳{subtotal.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(product?._id)}
                          disabled={removingId === product?._id}
                          className="mt-4 sm:mt-0 p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-red-600 hover:shadow-lg self-end sm:self-center"
                          title="Remove item"
                        >
                          {removingId === product?._id ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Clear Cart */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    onClick={handleClearCart}
                    disabled={clearing}
                    className="text-sm text-red-500 hover:text-white hover:bg-red-500 font-bold disabled:opacity-50 flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-600 hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {clearing ? 'Clearing...' : 'Clear Entire Cart'}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sticky top-8 animate-fade-in-up delay-150">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-sm">🧾</span>
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100/60 shadow-inner">
                  {cart.products.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-slate-600 font-medium">
                      <span className="truncate flex-1 pr-3">
                        {item.product?.name?.en || 'Product'} × {item.quantity}
                      </span>
                      <span className="font-bold flex-shrink-0 text-slate-800">
                        ৳{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ৳{cart.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-glow w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-1"
                >
                  Proceed to Checkout
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <div className="mt-6 flex items-start gap-3 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                  <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <p className="text-xs text-teal-800 font-medium">Safe and secure checkout. You will receive an email confirmation after placing your order.</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
