import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Team() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/users').then(r => { setUsers(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const changeRole = async (u, role) => {
    try {
      await api.patch(`/users/${u.id}/role`, null, { params: { role } })
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to change role')
    }
  }

  return (
    <div style={{ padding: '2.5rem 2.5rem' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Workspace</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Team</h1>
      <p style={{ fontSize: '0.875rem', color: '#71717a', marginBottom: '2rem' }}>{users.length} {users.length === 1 ? 'member' : 'members'}</p>

      {loading ? (
        <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Loading…</p>
      ) : (
        <div style={{ border: '1px solid #27272a', borderRadius: 8, overflow: 'hidden', background: '#18181b' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '5fr 4fr 2fr 1fr',
            padding: '0.75rem 1rem', borderBottom: '1px solid #27272a',
            fontSize: '0.6875rem', fontWeight: 700, color: '#71717a',
            textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>
            <div>Member</div><div>Email</div><div>Joined</div><div style={{ textAlign: 'right' }}>Role</div>
          </div>

          {users.map((u, i) => {
            const isYou = u.id === user?.id
            const initials = getInitials(u.name)
            const isUserAdmin = u.role === 'admin'
            return (
              <div key={u.id} style={{
                display: 'grid', gridTemplateColumns: '5fr 4fr 2fr 1fr',
                padding: '0.75rem 1rem',
                borderBottom: i < users.length - 1 ? '1px solid #27272a' : 'none',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#0f0f11'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Member */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isUserAdmin ? '#2563eb' : '#3f3f46',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: '#fff',
                  }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#e4e4e7', fontWeight: 500 }}>{u.name}</div>
                    {isYou && <div style={{ fontSize: '0.625rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>You</div>}
                  </div>
                </div>

                {/* Email */}
                <div style={{ fontSize: '0.875rem', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>

                {/* Joined */}
                <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{formatDate(u.created_at)}</div>

                {/* Role */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isAdmin && !isYou ? (
                    <select
                      value={u.role}
                      onChange={e => changeRole(u, e.target.value)}
                      style={{
                        background: '#09090b', border: '1px solid #3f3f46',
                        borderRadius: 6, color: '#e4e4e7', fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.2em 0.6em', borderRadius: 9999,
                      fontSize: '0.75rem', fontWeight: 600,
                      background: isUserAdmin ? 'rgba(37,99,235,0.15)' : '#27272a',
                      color: isUserAdmin ? '#93c5fd' : '#a1a1aa',
                      border: `1px solid ${isUserAdmin ? 'rgba(37,99,235,0.3)' : '#3f3f46'}`,
                    }}>
                      {isUserAdmin ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      )}
                      {u.role}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
