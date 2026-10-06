import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const STATUS_COLORS = {
  Pending:    'bg-yellow-100 text-yellow-800 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-800 border-blue-300',
  Shipped:    'bg-purple-100 text-purple-800 border-purple-300',
  Delivered:  'bg-green-100 text-green-800 border-green-300',
  Cancelled:  'bg-red-100 text-red-800 border-red-300',
}

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered']
const ALL_STATUSES  = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      {status}
    </span>
  )
}

function ProgressBar({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 text-red-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm font-medium">Order Cancelled</span>
        </div>
      </div>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(status)

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, index) => (
          <div key={step} className="flex-1 flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${index <= currentStep
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium whitespace-nowrap
                  ${index <= currentStep ? 'text-green-600' : 'text-gray-400'}`}
              >
                {step}
              </span>
            </div>
            {/* Line between steps */}
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 rounded transition-all
                  ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OrderTracking() {
  const navigate   = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [user,     setUser]     = useState(null)
  const [updating, setUpdating] = useState(null) // orderId currently being updated

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(userData)
    fetchOrders(userData.role)
  }, [])

  const fetchOrders = async (role) => {
    try {
      const token = localStorage.getItem('token')
      // Admins see every order; regular users see only their own
      const url = role === 'admin' ? '/api/orders' : '/api/orders/my-orders'
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(response.data)
    } catch (err) {
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 drop-shadow-md" />
          <p className="text-slate-600 font-bold animate-pulse">Loading orders...</p>
        </div>
      </div>
    )
  }

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
                  {user?.role === 'admin' ? "📊 Dashboard" : "📦 Tracking"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                {user?.role === 'admin' ? 'All ' : 'My '}
                <span className="animate-text-shimmer">Orders</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                {user?.role === 'admin'
                  ? 'Manage every order across the platform. Update statuses and maintain the marketplace.'
                  : 'Monitor the status of your purchases in real-time.'}
              </p>
            </div>
            
            <div className="animate-float hidden md:block">
              <button
                onClick={() => navigate('/products')}
                className="w-32 h-32 glass-dark rounded-3xl flex flex-col items-center justify-center relative hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">🛍️</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">✨</div>
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-bold text-xs uppercase tracking-wider">Shop More</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 shadow-sm animate-slide-down flex items-center gap-3">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't made any purchases yet. Explore our marketplace to find something amazing.</p>
            <Link
              to="/products"
              className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Order header bar */}
                <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-5 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap items-center gap-8 text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Order ID</span>
                      <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{order._id}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Date</span>
                      <span className="text-slate-800 font-semibold">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Total</span>
                      <span className="font-extrabold text-emerald-600 text-base">
                        ৳{order.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Order body */}
                <div className="px-6 py-5">
                  <div className="flex flex-wrap gap-8 mb-4">
                    {/* Product info */}
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Product(s)</p>
                      <p className="text-gray-900 font-semibold">{order.productName}</p>
                    </div>

                    {/* Customer info */}
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Customer</p>
                      <p className="text-gray-900 font-medium">{order.customerName}</p>
                      <p className="text-gray-500 text-sm">{order.customerEmail}</p>
                    </div>
                  </div>

                  {/* Progress bar (non-admin view) */}
                  {user?.role !== 'admin' && (
                    <ProgressBar status={order.status} />
                  )}

                  {/* Admin status updater */}
                  {user?.role === 'admin' && (
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      <label className="text-sm font-medium text-gray-700">
                        Update Status:
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            disabled={order.status === s || updating === order._id}
                            onClick={() => handleStatusUpdate(order._id, s)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all
                              ${order.status === s
                                ? 'cursor-default opacity-60 ' + STATUS_COLORS[s]
                                : 'bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700'
                              }
                              ${updating === order._id ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {updating === order._id && order.status !== s ? (
                              <span className="flex items-center gap-1">
                                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                {s}
                              </span>
                            ) : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
