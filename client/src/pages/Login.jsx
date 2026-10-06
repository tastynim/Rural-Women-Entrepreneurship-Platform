import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(sessionStorage.getItem('authMessage') || '')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('authMessage')) {
      sessionStorage.removeItem('authMessage')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('/api/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700 items-center justify-center overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 hero-pattern" />

        {/* floating blobs */}
        <div className="absolute top-16 left-12 w-48 h-48 bg-emerald-500/20 deco-blob" />
        <div className="absolute bottom-20 right-8 w-64 h-64 bg-teal-400/15 deco-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-16 w-32 h-32 bg-green-300/20 deco-blob" style={{ animationDelay: '6s' }} />

        {/* orbiting rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border border-white/10 absolute animate-pulse2" />
          <div className="w-96 h-96 rounded-full border border-white/5 absolute animate-pulse2" style={{ animationDelay: '1s' }} />
        </div>

        {/* content */}
        <div className="relative z-10 text-center px-12 animate-fade-in-up">
          <div className="w-24 h-24 bg-white/15 glass rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
            <span className="text-5xl">🌿</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Rural Women<br />
            <span className="animate-text-shimmer">Empowerment</span>
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed max-w-xs mx-auto">
            Connecting rural entrepreneurs with markets, mentors, and opportunities.
          </p>

          {/* stat pills */}
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            {[['500+', 'Entrepreneurs'], ['200+', 'Products'], ['50+', 'Mentors']].map(([num, label]) => (
              <div key={label} className="glass-dark rounded-2xl px-5 py-3 text-center animate-fade-in-up delay-300">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="text-emerald-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-emerald-50 relative">
        {/* subtle background decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-100 rounded-full blur-2xl opacity-60 translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-md relative z-10 animate-slide-left">
          {/* Logo (mobile only) */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🌿</span>
            <p className="text-emerald-700 font-bold text-lg mt-2">Rural Empowerment</p>
          </div>

          <div className="glass rounded-3xl shadow-2xl p-8 border border-white/60">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-7">Sign in to your account to continue</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 animate-slide-down">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4.5 h-4.5 text-gray-400 w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'} name="password" required
                    value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPass
                      ? <svg className="w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
