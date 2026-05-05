import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login({ email, password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: '#09090b', border: '1px solid #27272a',
    borderRadius: 6, color: '#fff', fontSize: '0.9375rem',
    padding: '0.625rem 0.75rem', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
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

        {/* Brand */}
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

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
            OPERATIONAL CONTROL
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Ship what matters.<br />Track every task.
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#71717a', lineHeight: 1.6, maxWidth: 320 }}>
            A command-center for small teams: projects, tasks, status, and overdue radar in one dense, distraction-free console.
          </p>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.6875rem', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            © 2026 TASKFLOW · BUILT FOR TEAMS
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '3rem 3rem',
        background: '#09090b',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>SIGN IN</p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>Welcome back</h2>
          <p style={{ fontSize: '0.875rem', color: '#71717a' }}>Use your credentials to access your workspace.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, color: '#fca5a5', fontSize: '0.875rem', padding: '0.625rem 0.75rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#27272a'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>PASSWORD</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#27272a'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.75rem', background: '#2563eb',
            border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.9375rem',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#1d4ed8' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#2563eb' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#52525b' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = '#a5b4fc'}
            onMouseLeave={e => e.target.style.color = '#818cf8'}
          >Create one</Link>
        </p>
      </div>
    </div>
  )
}
