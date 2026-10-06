import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  Pending:  'bg-amber-100 text-amber-800 border-amber-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
}

const STATUS_ICONS = {
  Pending:  '⏳',
  Approved: '✅',
  Rejected: '❌',
}

export default function SkillCertification() {
  const navigate  = useNavigate()
  const fileRef   = useRef(null)

  const [certs,    setCerts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [uploading,setUploading]= useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [showForm, setShowForm] = useState(false)
  const [user,     setUser]     = useState(null)

  const [form, setForm] = useState({
    skillName: '',
    issuedBy:  '',
    issuedDate:'',
  })
  const [file, setFile] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchCerts()
  }, [])

  const fetchCerts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/skill-certs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCerts(res.data)
    } catch (err) {
      setError('Failed to load certifications.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const allowed = ['image/jpeg','image/jpg','image/png','application/pdf']
    if (!allowed.includes(f.type)) {
      setError('Only JPG, PNG, or PDF files are allowed.')
      e.target.value = ''
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5 MB.')
      e.target.value = ''
      return
    }
    setError('')
    setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a certification file.'); return }
    setUploading(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('certificationFile', file)
    fd.append('skillName',  form.skillName)
    if (form.issuedBy)   fd.append('issuedBy',   form.issuedBy)
    if (form.issuedDate) fd.append('issuedDate',  form.issuedDate)

    try {
      await axios.post('/api/skill-certs', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess('Certification uploaded! It is pending admin review.')
      setForm({ skillName: '', issuedBy: '', issuedDate: '' })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
      fetchCerts()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certification?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/skill-certs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCerts(certs.filter(c => c._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-700 font-medium">Loading certifications…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-blue-900 via-indigo-800 to-cyan-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-cyan-300/15 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 animate-slide-right">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-semibold rounded-full border border-blue-400/30">
                  📜 Verification
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Skill{' '}
                <span className="animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200">Certifications</span>
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
                Upload and verify your professional certificates to build trust and showcase your expertise to the community.
              </p>
            </div>

            <div className="animate-float hidden md:block">
              <div className="w-40 h-40 glass-dark rounded-3xl flex items-center justify-center relative">
                <span className="text-7xl">🎓</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-300">🏅</div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-sm animate-bounce-in delay-500">✨</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 flex-wrap animate-fade-in-up delay-400">
            {[
              { n: certs.length, l: 'Total Certifications' },
              { n: certs.filter(c => c.status === 'Approved').length, l: 'Approved' },
              { n: certs.filter(c => c.status === 'Pending').length, l: 'Pending Review' },
            ].map(({ n, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-5 py-3 text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-blue-200 text-xs">{l}</p>
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

        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'All Certifications' : 'My Certifications'}
          </h2>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all btn-glow flex items-center gap-2
              ${showForm 
                ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
            </svg>
            {showForm ? 'Cancel Upload' : 'Upload Certificate'}
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              Upload New Certificate
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skill Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.skillName}
                    onChange={e => setForm({ ...form, skillName: e.target.value })}
                    placeholder="e.g. Handloom Weaving Masterclass"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issued By <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.issuedBy}
                    onChange={e => setForm({ ...form, issuedBy: e.target.value })}
                    placeholder="e.g. Bangladesh Rural Development Board"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Date <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={form.issuedDate}
                  onChange={e => setForm({ ...form, issuedDate: e.target.value })}
                  className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Document <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${file ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                        className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-700">Click to browse or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG, or PDF (Max 5 MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setFile(null); setForm({skillName:'', issuedBy:'', issuedDate:''}) }}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all btn-glow flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Uploading…</>
                  ) : 'Submit Certificate'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Certifications List */}
        <div className="space-y-4">
          {certs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-gray-500 text-lg font-medium">No certifications yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Upload your first certificate to get verified.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold btn-glow"
              >
                Upload Certificate
              </button>
            </div>
          ) : (
            certs.map((cert, idx) => (
              <div key={cert._id} 
                className="border border-gray-200 rounded-2xl p-5 bg-white card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.07}s` }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{cert.skillName}</h3>
                      
                      {user?.role === 'admin' && cert.user && (
                        <p className="text-sm text-gray-600 font-medium mt-0.5">
                          Uploaded by: <span className="text-gray-900">{cert.user.name}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        {cert.issuedBy && (
                          <span className="text-sm text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {cert.issuedBy}
                          </span>
                        )}
                        {cert.issuedDate && (
                          <span className="text-sm text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(cert.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Uploaded on {new Date(cert.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_STYLES[cert.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {STATUS_ICONS[cert.status]} {cert.status}
                    </span>

                    <div className="flex gap-2">
                      <a
                        href={`/uploads/${cert.certificationFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-colors"
                        title="View Certificate"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>

                      {user?.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(cert._id)}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info box */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex gap-4 items-start animate-fade-in-up delay-300">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">How Certification Works</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Upload your professional certificate (JPG, PNG, or PDF format).</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> The status will be marked as <strong className="text-gray-800">Pending</strong> while an administrator reviews it.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Once reviewed, the status changes to <strong className="text-gray-800">Approved</strong> or <strong className="text-gray-800">Rejected</strong>.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Approved certificates verify your skills on your profile, boosting credibility.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
