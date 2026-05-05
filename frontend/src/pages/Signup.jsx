import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

export default function Signup() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Member')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])
    const errs = []
    if (!displayName.trim()) errs.push('Full name is required.')
    if (!email.trim()) errs.push('Email is required.')
    if (password.length < 8) errs.push('Password must be at least 8 characters.')
    if (errs.length) { setErrors(errs); return }

    setLoading(true)
    try {
      await authService.register({ email, displayName, password, role })
      navigate('/login')
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data
      if (!err.response) {
        setErrors(['Cannot connect to server. Please wait a moment and try again.'])
      } else if (status === 404) {
        setErrors(['Server is starting up. Please wait 30 seconds and try again.'])
      } else if (status === 409) {
        setErrors(['This email is already registered. Please sign in instead.'])
      } else if (data?.details?.length) {
        setErrors(data.details)
      } else if (data?.error) {
        setErrors([data.error])
      } else {
        setErrors(['Registration failed. Please try again.'])
      }
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', background: '#09090b', border: '1px solid #27272a',
    borderRadius: 6, color: '#fff', fontSize: '0.9375rem',
    padding: '0.625rem 0.75rem', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a',
    textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b' }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '2rem 3rem', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 60%, rgba(99,102,241,0.12) 0%, transparent 60%), #0a0a0f',
        borderRight: '1px solid #18181b',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.015\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.4 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#fff', letterSpacing: '-0.01em' }}>TaskFlow</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>JOIN THE TEAM</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Manage tasks.<br />Ship faster.
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#71717a', lineHeight: 1.6, maxWidth: 320 }}>
            Create your account and start collaborating with your team on projects and tasks.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.6875rem', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            © 2026 TASKFLOW · BUILT FOR TEAMS
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '3rem 3rem', background: '#09090b',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>CREATE ACCOUNT</p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>Get started</h2>
          <p style={{ fontSize: '0.875rem', color: '#71717a' }}>Create your account to join your team.</p>
        </div>

        {errors.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, color: '#fca5a5', fontSize: '0.875rem', padding: '0.625rem 0.75rem', marginBottom: '1rem' }}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>FULL NAME</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="John Doe" required autoComplete="name" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#27272a'} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#27272a'} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" required autoComplete="new-password" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#27272a'} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>ROLE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {['Admin', 'Member'].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.625rem 1rem', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.15s',
                  background: role === r ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: `1px solid ${role === r ? 'rgba(99,102,241,0.5)' : '#27272a'}`,
                  color: role === r ? '#a5b4fc' : '#71717a',
                }}>
                  {r === 'Admin' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.75rem', background: '#2563eb',
            border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.9375rem',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1, transition: 'background 0.15s',
          }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#1d4ed8' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#2563eb' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#52525b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = '#a5b4fc'}
            onMouseLeave={e => e.target.style.color = '#818cf8'}
          >Sign in</Link>
        </p>
      </div>
    </div>
  )
}
