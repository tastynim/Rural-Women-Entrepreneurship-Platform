import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['General', 'Mentorship', 'Success Story', 'Training']

const CAT_META = {
  General:       { color: 'bg-blue-100 text-blue-700',   border: 'border-l-blue-500',   glow: 'from-blue-600 to-indigo-500' },
  Mentorship:    { color: 'bg-purple-100 text-purple-700', border: 'border-l-purple-500', glow: 'from-purple-600 to-violet-500' },
  'Success Story': { color: 'bg-amber-100 text-amber-700', border: 'border-l-amber-500',  glow: 'from-amber-500 to-orange-500' },
  Training:      { color: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-500', glow: 'from-emerald-600 to-teal-500' },
}

export default function Forum() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [activeCategory, setActiveCategory] = useState('')
  const [openPostId, setOpenPostId] = useState(null)
  const [commentText, setCommentText] = useState({})
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(null)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchPosts()
  }, [activeCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const url = activeCategory ? `/api/forum?category=${encodeURIComponent(activeCategory)}` : '/api/forum'
      const res = await axios.get(url)
      setPosts(res.data)
    } catch {
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    setSubmitting(true); setError('')
    try {
      await axios.post('/api/forum', newPost, { headers: { Authorization: `Bearer ${token}` } })
      setNewPost({ title: '', content: '', category: 'General' })
      setShowNewPostForm(false)
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async (postId) => {
    const text = (commentText[postId] || '').trim()
    if (!text) return
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    setCommentSubmitting(postId)
    try {
      await axios.post(`/api/forum/${postId}/comment`, { text }, { headers: { Authorization: `Bearer ${token}` } })
      setCommentText({ ...commentText, [postId]: '' })
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment.')
    } finally {
      setCommentSubmitting(null)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/forum/${postId}`, { headers: { Authorization: `Bearer ${token}` } })
      setPosts(posts.filter(p => p._id !== postId))
      if (openPostId === postId) setOpenPostId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post.')
    }
  }

  const canDelete = (post) => user && (user.role === 'admin' || post.user?._id === user._id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/20">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/30">
                  💬 Community Space
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Community{' '}
                <span className="animate-text-shimmer">Forum</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                Share experiences, ask questions, and grow together with fellow entrepreneurs.
              </p>
              <button
                onClick={() => {
                  if (!localStorage.getItem('token')) { navigate('/login'); return }
                  setShowNewPostForm(!showNewPostForm)
                }}
                className="mt-6 px-6 py-3 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {showNewPostForm ? 'Cancel' : 'New Post'}
              </button>
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">💬</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-violet-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">🤝</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">💡</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: posts.length, l: 'Posts' },
              { n: posts.reduce((a, p) => a + (p.comments?.length || 0), 0), l: 'Comments' },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-slate-300 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex justify-between items-center animate-slide-down">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-3">✕</button>
          </div>
        )}

        {/* New Post Form */}
        {showNewPostForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 mb-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm">✍️</span>
              Create a New Post
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input type="text" required value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What would you like to discuss?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => {
                    const meta = CAT_META[cat] || CAT_META.General
                    return (
                      <button key={cat} type="button"
                        onClick={() => setNewPost({ ...newPost, category: cat })}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          newPost.category === cat
                            ? `bg-gradient-to-r ${meta.glow} text-white border-transparent shadow-md`
                            : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                        }`}>
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
                <textarea required rows={5} value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or experiences..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewPostForm(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 btn-glow">
                  {submitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Posting…</> : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
              activeCategory === '' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
            }`}>All Posts</button>
          {CATEGORIES.map(cat => {
            const meta = CAT_META[cat] || CAT_META.General
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                  activeCategory === cat
                    ? `bg-gradient-to-r ${meta.glow} text-white border-transparent shadow-md`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                }`}>
                {cat}
              </button>
            )
          })}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 rounded w-2/3" />
                    <div className="skeleton h-3 rounded w-1/3" />
                  </div>
                </div>
                <div className="skeleton h-4 rounded w-full mb-2" />
                <div className="skeleton h-4 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-16 text-center animate-fade-in-up">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600 text-lg font-semibold mb-1">No posts yet</p>
            <p className="text-gray-400 text-sm mb-5">Be the first to start a discussion!</p>
            <button onClick={() => { if (!localStorage.getItem('token')) { navigate('/login'); return } setShowNewPostForm(true) }}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold btn-glow">
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, idx) => {
              const meta = CAT_META[post.category] || CAT_META.General
              return (
                <div key={post._id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover border-l-4 ${meta.border} animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 0.06}s` }}>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-700 font-bold text-sm">{post.user?.name?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{post.title}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>{post.category}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            By <span className="font-semibold text-gray-600">{post.user?.name || 'Unknown'}</span>
                            {' · '}
                            {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      {canDelete(post) && (
                        <button onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm mt-3 leading-relaxed">{post.content}</p>

                    <button onClick={() => setOpenPostId(openPostId === post._id ? null : post._id)}
                      className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 font-medium transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      {post.comments?.length || 0} Comment{post.comments?.length !== 1 ? 's' : ''}
                      <svg className={`w-3.5 h-3.5 transition-transform ${openPostId === post._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                  </div>

                  {openPostId === post._id && (
                    <div className="border-t border-gray-100 bg-slate-50 px-5 py-4 animate-slide-down">
                      {post.comments?.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {post.comments.map((comment, i) => (
                            <div key={i} className="flex gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-violet-700 font-bold text-xs">{comment.user?.name?.charAt(0).toUpperCase() || '?'}</span>
                              </div>
                              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-gray-200">
                                <span className="text-xs font-semibold text-gray-700">{comment.user?.name || 'User'}</span>
                                <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {comment.date ? new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-4">No comments yet. Be the first!</p>
                      )}

                      {user ? (
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-700 font-bold text-xs">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input type="text"
                              value={commentText[post._id] || ''}
                              onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleAddComment(post._id)}
                              placeholder="Write a comment…"
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                            <button onClick={() => handleAddComment(post._id)}
                              disabled={!commentText[post._id]?.trim() || commentSubmitting === post._id}
                              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all flex items-center gap-1">
                              {commentSubmitting === post._id
                                ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                              }
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          <button onClick={() => navigate('/login')} className="text-violet-600 font-semibold hover:underline">Log in</button> to join the discussion.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
