import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const STATUS_META = {
  Pending:  { cls: 'bg-amber-100 text-amber-800 border-amber-300', icon: '⏳' },
  Accepted: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✅' },
  Rejected: { cls: 'bg-red-100 text-red-800 border-red-300', icon: '❌' },
}

export default function Mentorship() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('browse')
  const [user, setUser] = useState(null)
  const [mentors, setMentors] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = localStorage.getItem('token')
  const authHeader = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mentorRes, sentRes, incomingRes] = await Promise.all([
        axios.get('/api/mentorship/mentors'),
        axios.get('/api/mentorship/my-requests', { headers: authHeader }),
        axios.get('/api/mentorship/incoming', { headers: authHeader }),
      ])
      setMentors(mentorRes.data)
      setSentRequests(sentRes.data)
      setIncomingRequests(incomingRes.data)
    } catch {
      setError('Failed to load mentorship data.')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500) }

  const handleSendRequest = async (e) => {
    e.preventDefault()
    if (!selectedMentor) { setError('Please select a mentor first.'); return }
    setActionLoading('send'); setError('')
    try {
      await axios.post('/api/mentorship/request', { mentorId: selectedMentor._id, message }, { headers: authHeader })
      showSuccess(`Mentorship request sent to ${selectedMentor.name}!`)
      setSelectedMentor(null); setMessage('')
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusUpdate = async (requestId, status) => {
    setActionLoading(requestId)
    try {
      await axios.put(`/api/mentorship/request/${requestId}/status`, { status }, { headers: authHeader })
      showSuccess(`Request ${status.toLowerCase()} successfully.`)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request.')
    } finally {
      setActionLoading(null)
    }
  }

  const TABS = [
    { key: 'browse',   label: 'Browse Mentors',   icon: '🔍', count: null },
    { key: 'sent',     label: 'My Requests',       icon: '📤', count: sentRequests.length },
    { key: 'incoming', label: 'Incoming',           icon: '📥', count: incomingRequests.filter(r => r.status === 'Pending').length },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-700 font-medium">Loading mentorship data…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/20">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-800 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-orange-300/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-200 text-xs font-semibold rounded-full border border-amber-400/30">
                  🤝 Mentorship Program
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Grow With a{' '}
                <span className="animate-text-shimmer">Mentor</span>
              </h1>
              <p className="text-amber-100 text-lg leading-relaxed max-w-lg">
                Connect with experienced entrepreneurs who can guide you, share knowledge, and help your business thrive.
              </p>
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">🤝</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">⭐</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">🌱</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: mentors.length, l: 'Available Mentors' },
              { n: sentRequests.length, l: 'Requests Sent' },
              { n: incomingRequests.filter(r => r.status === 'Accepted').length, l: 'Active Mentorships' },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-amber-200 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex justify-between items-center animate-slide-down">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-3">✕</button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 animate-slide-down">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="flex border-b border-gray-100">
            {TABS.map(({ key, label, icon, count }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-4 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  tab === key
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-b-2 border-amber-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
                {count !== null && count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === key ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Browse Mentors ── */}
            {tab === 'browse' && (
              <div className="space-y-6">
                {mentors.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in-up">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-500 text-lg font-medium">No mentors available yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Entrepreneurs who register will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentors.map((mentor, idx) => (
                      <div key={mentor._id}
                        className={`border-2 rounded-2xl p-5 cursor-pointer transition-all card-hover animate-fade-in-up ${
                          selectedMentor?._id === mentor._id
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg'
                            : 'border-gray-200 hover:border-amber-300 bg-white'
                        }`}
                        style={{ animationDelay: `${idx * 0.07}s` }}
                        onClick={() => setSelectedMentor(selectedMentor?._id === mentor._id ? null : mentor)}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-amber-800 font-bold text-2xl flex-shrink-0">
                            {mentor.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-gray-900">{mentor.name}</p>
                              {selectedMentor?._id === mentor._id && (
                                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">Selected</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{mentor.email}</p>
                            {mentor.location && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">📍 {mentor.location}</p>
                            )}
                            {mentor.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {mentor.skills.map((skill, i) => (
                                  <span key={i} className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedMentor && (
                  <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 animate-scale-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                      Send Request to <span className="text-amber-700">{selectedMentor.name}</span>
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Tell the mentor why you'd like their guidance.</p>
                    <form onSubmit={handleSendRequest} className="space-y-4">
                      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                        placeholder="e.g. I'm a new entrepreneur interested in your expertise in weaving and handicrafts…"
                        className="w-full px-3 py-2.5 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none" />
                      <div className="flex gap-3">
                        <button type="submit" disabled={actionLoading === 'send'}
                          className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all btn-glow flex items-center justify-center gap-2">
                          {actionLoading === 'send' ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending…</> : 'Send Request'}
                        </button>
                        <button type="button" onClick={() => { setSelectedMentor(null); setMessage('') }}
                          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-white transition-colors">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ── Sent Requests ── */}
            {tab === 'sent' && (
              sentRequests.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="text-6xl mb-4">📤</div>
                  <p className="text-gray-500 text-lg font-medium">No requests sent yet.</p>
                  <button onClick={() => setTab('browse')} className="mt-4 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold btn-glow">Browse Mentors</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((req, idx) => {
                    const sm = STATUS_META[req.status] || STATUS_META.Pending
                    return (
                      <div key={req._id}
                        className="border border-gray-200 rounded-2xl p-5 bg-white card-hover animate-fade-in-up"
                        style={{ animationDelay: `${idx * 0.07}s` }}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                              {req.mentor?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{req.mentor?.name}</p>
                              <p className="text-sm text-gray-500">{req.mentor?.email}</p>
                              {req.mentor?.location && <p className="text-xs text-gray-400 mt-0.5">📍 {req.mentor.location}</p>}
                              {req.message && <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 rounded-lg px-3 py-2">"{req.message}"</p>}
                              <p className="text-xs text-gray-400 mt-2">Sent {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${sm.cls}`}>
                            {sm.icon} {req.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* ── Incoming Requests ── */}
            {tab === 'incoming' && (
              incomingRequests.length === 0 ? (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="text-6xl mb-4">📥</div>
                  <p className="text-gray-500 text-lg font-medium">No incoming requests.</p>
                  <p className="text-gray-400 text-sm mt-1">When someone sends you a mentorship request, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((req, idx) => {
                    const sm = STATUS_META[req.status] || STATUS_META.Pending
                    return (
                      <div key={req._id}
                        className="border border-gray-200 rounded-2xl p-5 bg-white card-hover animate-fade-in-up"
                        style={{ animationDelay: `${idx * 0.07}s` }}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-purple-700 font-bold text-xl flex-shrink-0">
                              {req.mentee?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{req.mentee?.name}</p>
                              <p className="text-sm text-gray-500">{req.mentee?.email}</p>
                              {req.mentee?.location && <p className="text-xs text-gray-400 mt-0.5">📍 {req.mentee.location}</p>}
                              {req.message && <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">"{req.message}"</p>}
                              <p className="text-xs text-gray-400 mt-2">Received {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${sm.cls}`}>
                              {sm.icon} {req.status}
                            </span>
                            {req.status === 'Pending' && (
                              <div className="flex gap-2 mt-1">
                                <button disabled={actionLoading === req._id} onClick={() => handleStatusUpdate(req._id, 'Accepted')}
                                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all btn-glow flex items-center gap-1">
                                  {actionLoading === req._id ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : '✓'} Accept
                                </button>
                                <button disabled={actionLoading === req._id} onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all">✕ Reject</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
