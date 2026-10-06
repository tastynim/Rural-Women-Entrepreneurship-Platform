import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const METHODS = [
  {
    key: 'bank',
    label: 'Bank Transfer',
    icon: '🏦',
    color: 'border-blue-500 bg-blue-50',
    activeColor: 'ring-2 ring-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    desc: 'Transfer directly to our bank account',
  },
  {
    key: 'bkash',
    label: 'bKash',
    icon: '📱',
    color: 'border-pink-500 bg-pink-50',
    activeColor: 'ring-2 ring-pink-500',
    badge: 'bg-pink-100 text-pink-700',
    desc: 'Pay using your bKash mobile wallet',
  },
  {
    key: 'rocket',
    label: 'Rocket',
    icon: '🚀',
    color: 'border-purple-500 bg-purple-50',
    activeColor: 'ring-2 ring-purple-500',
    badge: 'bg-purple-100 text-purple-700',
    desc: 'Pay using your Rocket mobile wallet',
  },
]

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()

  // Read orderId & amount from navigation state or query params
  const searchParams = new URLSearchParams(location.search)
  const initialOrderId = location.state?.orderId || searchParams.get('orderId') || ''
  const initialAmount  = location.state?.amount  || searchParams.get('amount')  || ''

  const [orderId, setOrderId]       = useState(initialOrderId)
  const [amount,  setAmount]        = useState(initialAmount)
  const [method,  setMethod]        = useState('bank')
  const [loading, setLoading]       = useState(false)
  const [error,   setError]         = useState('')
  const [result,  setResult]        = useState(null) // success payload

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderId.trim()) { setError('Please enter a valid Order ID.'); return }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount.'); return }

    setLoading(true)
    setError('')
    setResult(null)

    const token = localStorage.getItem('token')
    try {
      const response = await axios.post(
        `/api/payments/${method}`,
        { orderId: orderId.trim(), amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Initiated!</h2>
          <p className="text-gray-500 mb-6">Your payment record has been created successfully.</p>

          {/* Payment summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-gray-800 text-xs truncate max-w-[200px]">
                {result.payment?.order || orderId}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-green-600">৳{result.payment?.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="capitalize font-medium text-gray-800">{result.payment?.method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                {result.payment?.status}
              </span>
            </div>
          </div>

          {/* Bank / mobile instructions */}
          {result.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd" />
                </svg>
                Payment Instructions
              </p>
              <p className="text-sm text-blue-700">{result.instructions}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to="/orders"
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors text-sm"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Payment form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proceed to Payment</h1>
            <p className="text-sm text-gray-500 mt-0.5">Choose your preferred payment method</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-4">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Order details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">1</span>
              Order Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="Paste your Order ID here"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Find your Order ID in <Link to="/orders" className="text-green-600 hover:underline">My Orders</Link>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (৳) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">৳</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    required
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">2</span>
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {METHODS.map(m => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all
                    ${method === m.key
                      ? `${m.color} ${m.activeColor} shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {method === m.key && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className="text-2xl mb-2 block">{m.icon}</span>
                  <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Method-specific info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {method === 'bank' && (
                <div className="flex gap-3">
                  <span className="text-blue-500 text-xl flex-shrink-0">🏦</span>
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">Bank Transfer Instructions</p>
                    <p>After submitting, you will receive the bank account details to complete the transfer manually.</p>
                    <p className="mt-1 text-gray-500">Bank: DBBL | Account: Rural Women Empowerment</p>
                  </div>
                </div>
              )}
              {method === 'bkash' && (
                <div className="flex gap-3">
                  <span className="text-pink-500 text-xl flex-shrink-0">📱</span>
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">bKash Payment</p>
                    <p>Send money to our bKash merchant number. You will see the number after submitting.</p>
                    <p className="mt-1 text-xs text-yellow-600 font-medium">⚠️ Full bKash API integration coming soon.</p>
                  </div>
                </div>
              )}
              {method === 'rocket' && (
                <div className="flex gap-3">
                  <span className="text-purple-500 text-xl flex-shrink-0">🚀</span>
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">Rocket Payment</p>
                    <p>Send money to our Rocket merchant number. You will see the number after submitting.</p>
                    <p className="mt-1 text-xs text-yellow-600 font-medium">⚠️ Full Rocket API integration coming soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total recap */}
          {amount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-green-700 font-medium">Total to Pay</p>
                <p className="text-xs text-green-600">via {METHODS.find(m2 => m2.key === method)?.label}</p>
              </div>
              <span className="text-3xl font-extrabold text-green-700">৳{Number(amount).toLocaleString()}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing Payment…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Confirm Payment · ৳{Number(amount || 0).toLocaleString()}
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            By completing payment you confirm your order and agree to our terms.
          </p>
        </form>
      </div>
    </div>
  )
}
