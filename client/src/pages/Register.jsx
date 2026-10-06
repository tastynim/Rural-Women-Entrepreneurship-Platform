import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    location: '',
    skills: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  // null = still checking, true = users exist, false = no users yet
  const [hasUsers, setHasUsers] = useState(null)

  useEffect(() => {
    axios.get('/api/auth/has-users')
      .then(res => {
        setHasUsers(res.data.hasUsers)
        // If first user, default role is admin (backend will force it anyway)
        if (!res.data.hasUsers) {
          setFormData(prev => ({ ...prev, role: 'admin' }))
        }
      })
      .catch(() => setHasUsers(true)) // fail-safe: assume users exist
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
      
      const response = await axios.post('/api/auth/register', {
        ...formData,
        skills: skillsArray
      })

      if (response.data.requiresApproval) {
        sessionStorage.setItem(
          'authMessage',
          response.data.message || 'Registration successful. Please wait for admin approval before logging in.'
        )
        navigate('/login')
        return
      }

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const isFirstUser = hasUsers === false

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '2.5rem',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #10b981, #0d9488)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '28px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)'
          }}>
            {isFirstUser ? '👑' : '✨'}
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            {hasUsers === null ? 'Create Account' : isFirstUser ? 'First Admin Setup' : 'Create Account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
            {isFirstUser
              ? 'You are the first user — you will be registered as Admin'
              : 'Join the marketplace today'}
          </p>
        </div>

        {/* First-user notice banner */}
        {isFirstUser && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: '14px',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem'
          }}>
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>👑</span>
            <p style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
              No users exist yet. The first account is automatically granted <strong>Admin</strong> privileges and can manage all users from the Analytics page.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.25rem',
            color: '#fca5a5', fontSize: '0.875rem', fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.25rem',
            color: '#6ee7b7', fontSize: '0.875rem', fontWeight: 500
          }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full Name
            </label>
            <input
              type="text" name="name" required
              value={formData.name} onChange={handleChange}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <input
              type="email" name="email" required
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              type="password" name="password" required
              value={formData.password} onChange={handleChange}
              placeholder="Create a strong password"
              style={inputStyle}
            />
          </div>

          {/* Role — only show if users exist (not first user) */}
          {hasUsers !== null && !isFirstUser && (
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                I am a…
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { value: 'customer', label: '🛒 Customer', desc: 'Browse & buy products' },
                  { value: 'entrepreneur', label: '🏪 Entrepreneur', desc: 'Sell your products' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: opt.value }))}
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      borderRadius: '14px',
                      border: formData.role === opt.value
                        ? '2px solid #10b981'
                        : '2px solid rgba(255,255,255,0.1)',
                      background: formData.role === opt.value
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{opt.label.split(' ')[0]}</div>
                    <div style={{ color: formData.role === opt.value ? '#34d399' : 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.8rem' }}>
                      {opt.label.split(' ').slice(1).join(' ')}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '0.2rem' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* First user — show locked admin badge */}
          {isFirstUser && (
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Role
              </label>
              <div style={{
                padding: '0.875rem 1rem',
                borderRadius: '14px',
                border: '2px solid rgba(245,158,11,0.4)',
                background: 'rgba(245,158,11,0.08)',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>👑</span>
                <div>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.875rem' }}>Administrator</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Auto-assigned for first account</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>🔒</span>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Location <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text" name="location"
              value={formData.location} onChange={handleChange}
              placeholder="e.g. Dhaka, Bangladesh"
              style={inputStyle}
            />
          </div>

          {/* Skills */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Skills <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional, comma-separated)</span>
            </label>
            <input
              type="text" name="skills"
              placeholder="e.g. weaving, pottery, handicraft"
              value={formData.skills} onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || hasUsers === null}
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem',
              borderRadius: '14px',
              border: 'none',
              background: loading || hasUsers === null
                ? 'rgba(16,185,129,0.4)'
                : 'linear-gradient(135deg, #10b981, #0d9488)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: loading || hasUsers === null ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em'
            }}
          >
            {loading ? 'Creating Account…' : hasUsers === null ? 'Checking…' : isFirstUser ? '👑 Create Admin Account' : '✨ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#34d399', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
}
