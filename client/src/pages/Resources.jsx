import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const TYPE_FILTERS = ['All', 'Video', 'Article']

const TYPE_META = {
  Video:   { bg: 'from-rose-600 to-orange-500',  icon: '▶', badge: 'bg-rose-100 text-rose-700',   btn: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white',   iconBg: 'bg-rose-100 text-rose-600' },
  Article: { bg: 'from-blue-600 to-indigo-500',  icon: '📄', badge: 'bg-blue-100 text-blue-700',   btn: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',   iconBg: 'bg-blue-100 text-blue-600' },
}

export default function Resources() {
  const navigate = useNavigate()
  const [resources, setResources]   = useState([])
  const [filter, setFilter]         = useState('All')
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser]             = useState(null)
  const [form, setForm] = useState({ title: '', description: '', type: 'Video', url: '' })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchResources()
  }, [filter])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const url = filter && filter !== 'All' ? `/api/resources?type=${filter}` : '/api/resources'
      const res = await axios.get(url)
      setResources(res.data)
    } catch {
      setError('Failed to load resources. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await axios.post('/api/resources', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSuccess('Resource added successfully!')
      setForm({ title: '', description: '', type: 'Video', url: '' })
      setShowForm(false)
      fetchResources()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add resource.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await axios.delete(`/api/resources/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setResources(resources.filter(r => r._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource.')
    }
  }

  const canAdd    = user?.role === 'entrepreneur' || user?.role === 'admin'
  const canDelete = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-teal-50/30">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-emerald-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                  📚 Learning Hub
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Training{' '}
                <span className="animate-text-shimmer">Resources</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                Videos and articles curated to help rural women entrepreneurs grow their skills and businesses.
              </p>
              {canAdd && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="mt-6 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg btn-glow-gold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {showForm ? 'Cancel' : 'Add Resource'}
                </button>
              )}
            </div>

            {/* Floating icon */}
            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">📖</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">✨</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">▶</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: resources.length || '–', l: 'Resources' },
              { n: resources.filter(r => r.type === 'Video').length || '–', l: 'Videos' },
              { n: resources.filter(r => r.type === 'Article').length || '–', l: 'Articles' },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-slate-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex justify-between items-center animate-slide-down">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-3 hover:text-red-900">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 animate-slide-down">
            ✅ {success}
          </div>
        )}

        {/* Add Resource Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 mb-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm">➕</span>
              Add New Resource
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" required value={form.title} onChange={handleChange}
                    placeholder="e.g. How to Start Selling Online"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                  <select name="type" value={form.type} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50">
                    <option value="Video">▶ Video</option>
                    <option value="Article">📄 Article</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input type="text" name="description" value={form.description} onChange={handleChange}
                  placeholder="Brief description (optional)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
                <input type="url" name="url" required value={form.url} onChange={handleChange}
                  placeholder="https://youtube.com/... or https://article-link.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all btn-glow flex items-center gap-2">
                  {submitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Saving…</> : 'Add Resource'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap items-center">
          {TYPE_FILTERS.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                filter === t
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-lg btn-glow'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}>
              {t === 'All' && '📚 All'}
              {t === 'Video' && '▶ Videos'}
              {t === 'Article' && '📄 Articles'}
            </button>
          ))}
          {!loading && (
            <span className="ml-auto text-sm text-gray-400 font-medium">
              {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
            </span>
          )}
        </div>

        {/* Resource Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-2 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 rounded w-3/4" />
                  <div className="skeleton h-4 rounded w-1/2" />
                  <div className="skeleton h-4 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-16 text-center animate-fade-in-up">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-semibold mb-1">No resources found</p>
            <p className="text-gray-400 text-sm">
              {canAdd ? 'Be the first to add a resource!' : 'Check back later for new content.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {resources.map((r, idx) => {
              const meta = TYPE_META[r.type] || TYPE_META.Article
              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden card-tilt flex flex-col group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  {/* Gradient top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${meta.bg}`} />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${meta.iconBg} group-hover:scale-110 transition-transform`}>
                          {r.type === 'Video'
                            ? <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            : <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">{r.title}</h3>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1.5 ${meta.badge}`}>{r.type}</span>
                        </div>
                      </div>
                      {canDelete && (
                        <button onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {r.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{r.description}</p>
                    )}
                    {r.uploadedBy?.name && (
                      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                        <span className="w-5 h-5 bg-gray-100 rounded-full inline-flex items-center justify-center text-xs font-bold text-gray-500">{r.uploadedBy.name.charAt(0)}</span>
                        {r.uploadedBy.name}
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <a href={r.url} target="_blank" rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm btn-glow ${meta.btn}`}>
                        {r.type === 'Video'
                          ? <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Watch Video</>
                          : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg> Read Article</>
                        }
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
