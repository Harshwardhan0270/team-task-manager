import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  },
  {
    to: '/projects', label: 'Projects',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  },
  {
    to: '/my-tasks', label: 'My Tasks',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  },
  {
    to: '/team', label: 'Team',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b' }}>
      {/* Sidebar */}
      <aside style={{
        width: 200, flexShrink: 0, background: '#09090b',
        borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid #27272a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em' }}>TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.5rem' }}>
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: 2,
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                color: active ? '#fff' : '#71717a',
                background: active ? '#18181b' : 'transparent',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#a1a1aa' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#71717a' }}
              >
                {icon}{label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #27272a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>{getInitials(user?.displayName)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.displayName}</div>
              <div style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.role || 'Member'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.4rem 0.625rem', background: 'transparent',
            border: '1px solid #27272a', borderRadius: 6, color: '#71717a',
            fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#27272a' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowX: 'hidden', background: '#09090b' }}>
        <Outlet />
      </main>
    </div>
  )
}
