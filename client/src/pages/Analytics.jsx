import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const ROLE_COLORS = {
  admin: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
  entrepreneur: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  customer: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
}

const ROLE_ICONS = { admin: '👑', entrepreneur: '🏪', customer: '🛒' }

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Users modal state
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [roleChanging, setRoleChanging] = useState(null) // userId being updated
  const [modalMsg, setModalMsg] = useState({ text: '', type: '' })

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = currentUser?.role === 'admin'

  const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const showModalMsg = (text, type = 'success') => {
    setModalMsg({ text, type })
    setTimeout(() => setModalMsg({ text: '', type: '' }), 3000)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/analytics/dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setStats(response.data.statistics)
      setRecentOrders(response.data.recentOrders)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openUsersModal = useCallback(async () => {
    if (!isAdmin) return
    setShowUsersModal(true)
    setUsersLoading(true)
    try {
      const res = await axios.get('/api/admin/users', { headers: auth() })
      setAllUsers(res.data)
    } catch (err) {
      showModalMsg('Failed to load users', 'error')
    } finally {
      setUsersLoading(false)
    }
  }, [isAdmin])

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?._id) {
      showModalMsg('You cannot change your own role', 'error')
      return
    }
    setRoleChanging(userId)
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, { headers: auth() })
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u))
      // Update stats count if needed
      await fetchAnalytics()
      showModalMsg(`Role updated to ${newRole} successfully!`, 'success')
    } catch (err) {
      showModalMsg(err.response?.data?.message || 'Failed to update role', 'error')
    } finally {
      setRoleChanging(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-teal-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm animate-slide-down flex justify-between items-center">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </span>
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                  📊 Overview
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Platform <span className="animate-text-shimmer">Analytics</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                View real-time insights and comprehensive metrics for your marketplace.
                {isAdmin && <span className="block mt-1 text-sm text-teal-300 font-medium">💡 Click "Total Users" to manage user roles.</span>}
              </p>
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-32 h-32 glass-dark rounded-3xl flex items-center justify-center relative border border-white/10 shadow-2xl">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">📈</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">💰</div>
                <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: 'Total Users',
              count: stats?.totalUsers || 0,
              color: 'from-amber-100 to-yellow-100 text-amber-700',
              clickable: isAdmin,
              onClick: openUsersModal,
              hint: isAdmin ? 'Click to manage roles' : null
            },
            { label: 'Total Orders', count: stats?.totalOrders || 0, color: 'from-emerald-100 to-teal-100 text-teal-700' },
            { label: 'Total Revenue', count: `৳${stats?.totalRevenue?.toLocaleString() || 0}`, color: 'from-indigo-100 to-purple-100 text-indigo-700' },
          ].map(({ label, count, color, clickable, onClick, hint }, i) => (
            <div
              key={label}
              onClick={clickable ? onClick : undefined}
              className={`bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-col items-center gap-3 animate-fade-in-up hover:-translate-y-1 transition-transform ${clickable ? 'cursor-pointer hover:border-amber-300 hover:shadow-amber-100/60' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`h-16 px-6 min-w-[4rem] rounded-2xl flex items-center justify-center font-black text-2xl bg-gradient-to-br ${color} shadow-inner`}>
                {count}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">{label}</p>
              {hint && (
                <span style={{
                  fontSize: '0.65rem', color: '#d97706', fontWeight: 700,
                  background: '#fef3c7', borderRadius: '8px', padding: '2px 8px',
                  border: '1px solid #fde68a', letterSpacing: '0.04em'
                }}>
                  👤 {hint}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up delay-200">
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-4">
            <h2 className="text-lg font-bold text-slate-800 ml-2">Recent Orders</h2>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
              </div>
              <p className="text-slate-500 font-bold">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 border-l-[3px] border-transparent hover:border-emerald-400 pl-5">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {order.customerEmail}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-emerald-600 text-right">
                        ৳{order.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-400 text-right">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Users Management Modal ── */}
      {showUsersModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowUsersModal(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
            animation: 'fadeInUp 0.25s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 1.75rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #0f172a, #134e4a)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '28px 28px 0 0'
            }}>
              <div>
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
                  👥 User Management
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                  {allUsers.length} registered user{allUsers.length !== 1 ? 's' : ''} · Click a role to reassign
                </p>
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', borderRadius: '12px', width: '40px', height: '40px',
                  fontSize: '1.125rem', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  transition: 'background 0.2s'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Message */}
            {modalMsg.text && (
              <div style={{
                margin: '1rem 1.75rem 0',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: modalMsg.type === 'error' ? '#fef2f2' : '#ecfdf5',
                border: `1px solid ${modalMsg.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
                color: modalMsg.type === 'error' ? '#b91c1c' : '#065f46',
                fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {modalMsg.type === 'error' ? '⚠️' : '✅'} {modalMsg.text}
              </div>
            )}

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem 1.75rem' }}>
              {usersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    border: '4px solid #e2e8f0', borderTopColor: '#10b981',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                </div>
              ) : allUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 600 }}>
                  No users found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {allUsers.map((user) => {
                    const rc = ROLE_COLORS[user.role] || ROLE_COLORS.customer
                    const isSelf = user._id === currentUser?._id
                    const isChanging = roleChanging === user._id
                    return (
                      <div key={user._id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '18px',
                        border: '1.5px solid #f1f5f9',
                        background: isSelf ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : '#fff',
                        transition: 'box-shadow 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                          background: 'linear-gradient(135deg, #d1fae5, #99f6e4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1.125rem', color: '#0f766e',
                          border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                              {user.name}
                            </span>
                            {isSelf && (
                              <span style={{
                                fontSize: '0.65rem', padding: '1px 6px', borderRadius: '6px',
                                background: '#d1fae5', color: '#065f46', fontWeight: 700
                              }}>YOU</span>
                            )}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </div>
                          {user.location && (
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '2px' }}>
                              📍 {user.location}
                            </div>
                          )}
                        </div>

                        {/* Current role badge + role selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem',
                            fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase',
                            background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`
                          }}>
                            {ROLE_ICONS[user.role]} {user.role}
                          </span>

                          {/* Role dropdown — disabled for self */}
                          {!isSelf && (
                            <div style={{ position: 'relative' }}>
                              <select
                                value={user.role}
                                disabled={isChanging}
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                style={{
                                  padding: '6px 28px 6px 10px',
                                  borderRadius: '10px',
                                  border: '2px solid #e2e8f0',
                                  background: isChanging ? '#f8fafc' : '#fff',
                                  color: '#475569',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: isChanging ? 'not-allowed' : 'pointer',
                                  outline: 'none',
                                  appearance: 'none',
                                  paddingRight: '28px',
                                  minWidth: '120px',
                                  transition: 'border-color 0.2s'
                                }}
                              >
                                <option value="customer">🛒 Customer</option>
                                <option value="entrepreneur">🏪 Entrepreneur</option>
                                <option value="admin">👑 Admin</option>
                              </select>
                              <span style={{
                                position: 'absolute', right: '8px', top: '50%',
                                transform: 'translateY(-50%)', pointerEvents: 'none',
                                color: '#94a3b8', fontSize: '0.7rem'
                              }}>▼</span>
                              {isChanging && (
                                <div style={{
                                  position: 'absolute', inset: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'rgba(255,255,255,0.8)', borderRadius: '10px'
                                }}>
                                  <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    border: '2px solid #e2e8f0', borderTopColor: '#10b981',
                                    animation: 'spin 0.8s linear infinite'
                                  }} />
                                </div>
                              )}
                            </div>
                          )}
                          {isSelf && (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                              (your account)
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.75rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'flex-end',
              background: '#fafafa',
              borderRadius: '0 0 28px 28px'
            }}>
              <button
                onClick={() => setShowUsersModal(false)}
                style={{
                  padding: '0.625rem 1.5rem', borderRadius: '12px',
                  border: 'none', background: 'linear-gradient(135deg, #10b981, #0d9488)',
                  color: '#fff', fontWeight: 800, fontSize: '0.875rem',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
