import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { key: 'users',    label: 'Pending Users' },
  { key: 'products', label: 'Pending Products' },
  { key: 'certs',    label: 'Certifications' },
  { key: 'stories',  label: 'Success Stories' },
]

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  entrepreneur: 'bg-blue-100 text-blue-700',
  customer: 'bg-green-100 text-green-700',
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')

  const [pendingUsers,    setPendingUsers]    = useState([])
  const [pendingProducts, setPendingProducts] = useState([])
  const [pendingCerts,    setPendingCerts]    = useState([])
  const [pendingStories,  setPendingStories]  = useState([])

  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user || user.role !== 'admin') { navigate('/products'); return }
    fetchAll()
  }, [])

  const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, p, c, s] = await Promise.all([
        axios.get('/api/admin/pending/users',         { headers: auth() }),
        axios.get('/api/admin/pending/products',      { headers: auth() }),
        axios.get('/api/admin/pending/certifications',{ headers: auth() }),
        axios.get('/api/success-stories/admin/all',   { headers: auth() }),
      ])
      setPendingUsers(u.data)
      setPendingProducts(p.data)
      setPendingCerts(c.data)
      // only show unapproved stories
      setPendingStories(s.data.filter(st => !st.isApproved))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // ── User actions ──────────────────────────────────────────────────────────
  const approveUser = async (id) => {
    try {
      await axios.put(`/api/admin/approve/user/${id}`, {}, { headers: auth() })
      setPendingUsers(prev => prev.filter(u => u._id !== id))
      showSuccess('User approved!')
    } catch { setError('Failed to approve user') }
  }
  const rejectUser = async (id) => {
    if (!window.confirm('Reject and delete this user?')) return
    try {
      await axios.delete(`/api/admin/reject/user/${id}`, { headers: auth() })
      setPendingUsers(prev => prev.filter(u => u._id !== id))
      showSuccess('User rejected.')
    } catch { setError('Failed to reject user') }
  }

  // ── Product actions ───────────────────────────────────────────────────────
  const approveProduct = async (id) => {
    try {
      await axios.put(`/api/admin/approve/product/${id}`, {}, { headers: auth() })
      setPendingProducts(prev => prev.filter(p => p._id !== id))
      showSuccess('Product approved!')
    } catch { setError('Failed to approve product') }
  }
  const rejectProduct = async (id) => {
    if (!window.confirm('Reject and delete this product?')) return
    try {
      await axios.delete(`/api/admin/reject/product/${id}`, { headers: auth() })
      setPendingProducts(prev => prev.filter(p => p._id !== id))
      showSuccess('Product rejected.')
    } catch { setError('Failed to reject product') }
  }

  // ── Certification actions ─────────────────────────────────────────────────
  const approveCert = async (id) => {
    try {
      await axios.put(`/api/admin/approve/certification/${id}`, {}, { headers: auth() })
      setPendingCerts(prev => prev.filter(c => c._id !== id))
      showSuccess('Certification approved!')
    } catch { setError('Failed to approve certification') }
  }
  const rejectCert = async (id) => {
    try {
      await axios.put(`/api/admin/reject/certification/${id}`, {}, { headers: auth() })
      setPendingCerts(prev => prev.filter(c => c._id !== id))
      showSuccess('Certification rejected.')
    } catch { setError('Failed to reject certification') }
  }

  // ── Story actions ─────────────────────────────────────────────────────────
  const approveStory = async (id) => {
    try {
      await axios.patch(`/api/success-stories/${id}/approve`, {}, { headers: auth() })
      setPendingStories(prev => prev.filter(s => s._id !== id))
      showSuccess('Story approved and published!')
    } catch { setError('Failed to approve story') }
  }
  const rejectStory = async (id) => {
    if (!window.confirm('Reject and delete this story?')) return
    try {
      await axios.delete(`/api/success-stories/${id}`, { headers: auth() })
      setPendingStories(prev => prev.filter(s => s._id !== id))
      showSuccess('Story rejected.')
    } catch { setError('Failed to reject story') }
  }

  const badgeCount = (count) =>
    count > 0 ? (
      <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] rounded-full font-bold shadow-sm">
        {count}
      </span>
    ) : null

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
                  🛡️ Administrator
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Platform <span className="animate-text-shimmer">Dashboard</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                Review and approve pending items. Maintain the quality and integrity of the marketplace.
              </p>
            </div>
            
            <div className="animate-float hidden md:block">
              <div className="w-32 h-32 glass-dark rounded-3xl flex items-center justify-center relative border border-white/10 shadow-2xl">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">⚙️</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">🛡️</div>
                <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex justify-between items-center shadow-sm animate-slide-down">
            <span className="font-medium flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </span>
            <button onClick={() => setError('')} className="font-bold hover:text-red-900 bg-red-100 p-1.5 rounded-lg transition-colors">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl mb-6 flex items-center shadow-sm animate-slide-down gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Pending Users',    count: pendingUsers.length,    color: 'from-amber-100 to-yellow-100 text-amber-700' },
            { label: 'Pending Products', count: pendingProducts.length, color: 'from-orange-100 to-rose-100 text-orange-700' },
            { label: 'Pending Certs',    count: pendingCerts.length,    color: 'from-blue-100 to-indigo-100 text-blue-700' },
            { label: 'Pending Stories',  count: pendingStories.length,  color: 'from-purple-100 to-fuchsia-100 text-purple-700' },
          ].map(({ label, count, color }, i) => (
            <div key={label} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-col items-center gap-3 animate-fade-in-up hover:-translate-y-1 transition-transform" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl bg-gradient-to-br ${color} shadow-inner`}>
                {count}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up delay-200">
          <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50 p-2 gap-2">
            {TABS.map(({ key, label }) => {
              const counts = { users: pendingUsers.length, products: pendingProducts.length, certs: pendingCerts.length, stories: pendingStories.length }
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-3 px-6 text-sm font-bold whitespace-nowrap rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === key
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-100'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  {label}
                  {badgeCount(counts[key])}
                </button>
              )
            })}
          </div>

          <div className="p-8 min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg" />
              </div>
            ) : (
              <>
                {/* ── Pending Users ── */}
                {activeTab === 'users' && (
                  pendingUsers.length === 0
                    ? <EmptyState message="No pending users — all caught up!" />
                    : <div className="space-y-4">
                        {pendingUsers.map((user, i) => (
                          <div key={user._id} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg hover:border-emerald-200 transition-all group animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex items-start gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-teal-700 font-black text-xl flex-shrink-0 shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-lg">{user.name}</p>
                                <p className="text-sm font-medium text-slate-500 mb-2">{user.email}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold shadow-sm ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-700'}`}>
                                    {user.role}
                                  </span>
                                  {user.location && <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 shadow-sm">📍 {user.location}</span>}
                                  {user.isRural && <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 shadow-sm">Rural</span>}
                                </div>
                                {user.skills?.length > 0 && <p className="text-xs text-slate-400 mt-3 font-medium">Skills: <span className="text-slate-600">{user.skills.join(', ')}</span></p>}
                                <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">{new Date(user.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <ActionButtons onApprove={() => approveUser(user._id)} onReject={() => rejectUser(user._id)} />
                          </div>
                        ))}
                      </div>
                )}

                {/* ── Pending Products ── */}
                {activeTab === 'products' && (
                  pendingProducts.length === 0
                    ? <EmptyState message="No pending products — all caught up!" />
                    : <div className="space-y-4">
                        {pendingProducts.map((product, i) => (
                          <div key={product._id} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg hover:border-emerald-200 transition-all group animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="font-bold text-slate-800 text-xl">{product.name?.en}</p>
                                {product.name?.bn && <span className="text-slate-400 text-sm font-medium">/ {product.name.bn}</span>}
                              </div>
                              <p className="text-sm text-slate-500 mb-3 line-clamp-2 max-w-2xl leading-relaxed">{product.description?.en}</p>
                              <div className="flex flex-wrap gap-3 mb-3">
                                <span className="px-3 py-1 rounded-lg text-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 text-emerald-700 font-extrabold shadow-sm">৳{product.price?.toLocaleString()}</span>
                                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-600 shadow-sm">{product.category}</span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium border-t border-slate-100 pt-3 inline-block mt-1">By: <span className="text-slate-700 font-bold">{product.createdBy?.name}</span> <span className="opacity-70">({product.createdBy?.email})</span></p>
                              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">{new Date(product.createdAt).toLocaleDateString()}</p>
                            </div>
                            <ActionButtons onApprove={() => approveProduct(product._id)} onReject={() => rejectProduct(product._id)} />
                          </div>
                        ))}
                      </div>
                )}

                {/* ── Pending Certifications ── */}
                {activeTab === 'certs' && (
                  pendingCerts.length === 0
                    ? <EmptyState message="No pending certifications — all caught up!" />
                    : <div className="space-y-4">
                        {pendingCerts.map((cert, i) => (
                          <div key={cert._id} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg hover:border-emerald-200 transition-all group animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <div>
                              <p className="font-bold text-slate-800 text-xl">{cert.skillName}</p>
                              {cert.issuedBy && <p className="text-sm font-medium text-slate-500 mb-1 mt-1">Issued by: <span className="text-slate-700">{cert.issuedBy}</span></p>}
                              {cert.issuedDate && (
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
                                  {new Date(cert.issuedDate).toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 font-medium">
                                Submitted by: <span className="font-bold text-slate-800">{cert.user?.name}</span> <span className="opacity-70">({cert.user?.email})</span>
                              </p>
                              {cert.certificationFile && (
                                <a
                                  href={`/uploads/${cert.certificationFile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  View Certificate
                                </a>
                              )}
                              <p className="text-[10px] font-bold text-slate-300 mt-3 absolute bottom-6 right-6 lg:static lg:mt-3 uppercase tracking-widest">{new Date(cert.createdAt).toLocaleDateString()}</p>
                            </div>
                            <ActionButtons onApprove={() => approveCert(cert._id)} onReject={() => rejectCert(cert._id)} rejectLabel="Reject" />
                          </div>
                        ))}
                      </div>
                )}

                {/* ── Pending Success Stories ── */}
                {activeTab === 'stories' && (
                  pendingStories.length === 0
                    ? <EmptyState message="No pending stories — all caught up!" />
                    : <div className="space-y-4">
                        {pendingStories.map((story, i) => (
                          <div key={story._id} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 hover:shadow-lg hover:border-emerald-200 transition-all group animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 text-xl">{story.title}</p>
                              <p className="text-sm text-slate-500 mt-2 mb-4 line-clamp-3 leading-relaxed max-w-3xl">{story.content}</p>
                              {story.images?.length > 0 && (
                                <div className="flex gap-2 mt-2 mb-4">
                                  {story.images.slice(0, 3).map((img, i) => (
                                    <img
                                      key={i}
                                      src={`/uploads/${img}`}
                                      alt=""
                                      className="w-20 h-20 object-cover rounded-xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform"
                                    />
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-slate-500 font-medium border-t border-slate-100 pt-3 inline-block">
                                By: <span className="font-bold text-slate-800">{story.entrepreneur?.name}</span>
                              </p>
                              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">{new Date(story.createdAt).toLocaleDateString()}</p>
                            </div>
                            <ActionButtons onApprove={() => approveStory(story._id)} onReject={() => rejectStory(story._id)} />
                          </div>
                        ))}
                      </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20 animate-fade-in-up">
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3 shadow-sm border border-emerald-100/50">
        <svg className="w-12 h-12 text-emerald-400 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-slate-500 text-lg font-bold">{message}</p>
    </div>
  )
}

function ActionButtons({ onApprove, onReject, rejectLabel = '✕ Reject' }) {
  return (
    <div className="flex gap-3 flex-shrink-0">
      <button
        onClick={onApprove}
        className="px-6 py-2.5 btn-glow bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-400 hover:to-teal-400 text-sm font-bold shadow-lg transition-transform transform hover:-translate-y-0.5 whitespace-nowrap"
      >
        ✓ Approve
      </button>
      <button
        onClick={onReject}
        className="px-6 py-2.5 bg-white border-2 border-red-50 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-sm font-bold shadow-sm transition-all whitespace-nowrap"
      >
        {rejectLabel}
      </button>
    </div>
  )
}
