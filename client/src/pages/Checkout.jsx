import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setFormData({
      customerName: user.name || '',
      customerEmail: user.email || '',
    })
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCart(response.data)
    } catch (err) {
      setError('Failed to load cart. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cart || !cart.products || cart.products.length === 0) {
      setError('Your cart is empty. Please add items before checking out.')
      return
    }

    setSubmitting(true)
    setError('')

    const token = localStorage.getItem('token')

    // Build a readable product summary for the order
    const productNames = cart.products
      .map((item) => {
        const name = item.product?.name?.en || 'Product'
        return item.quantity > 1 ? `${name} x${item.quantity}` : name
      })
      .join(', ')

    try {
      await axios.post(
        '/api/orders/create',
        {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          productName: productNames,
          totalPrice: cart.totalPrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Clear cart after successful order
      await axios.delete('/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Navigate to order tracking
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading checkout...</div>
      </div>
    )
  }

  const isEmpty = !cart || !cart.products || cart.products.length === 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/cart" className="text-green-600 hover:text-green-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-sm text-gray-500 mt-1">{cart.products.length} item(s)</p>
                </div>

                <ul className="divide-y divide-gray-200">
                  {cart.products.map((item) => (
                    <li key={item._id} className="px-6 py-4 flex justify-between items-center">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product?.name?.en || 'Product'}
                        </p>
                        {item.product?.name?.bn && (
                          <p className="text-sm text-gray-400">{item.product.name.bn}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-0.5">
                          ৳{item.product?.price?.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600 whitespace-nowrap">
                        ৳{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ৳{cart.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-700">
                  A confirmation email will be sent to your email address once the order is placed.
                  You can also track your order status from <strong>My Orders</strong>.
                </p>
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Your Details</h2>
                <p className="text-sm text-gray-500 mt-1">We'll use this to send your confirmation</p>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Order confirmation will be sent to this address.
                  </p>
                </div>

                {/* Order total recap */}
                <div className="rounded-md bg-green-50 border border-green-200 p-4 flex justify-between items-center">
                  <span className="font-medium text-green-800">Amount to Pay</span>
                  <span className="text-xl font-bold text-green-700">
                    ৳{cart.totalPrice?.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Confirm & Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400">
                  By placing this order you agree to support rural women entrepreneurs.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
