import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/dashboard'
import { useAuth } from '../context/AuthContext'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function todayStr() {
  const d = new Date()
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function StatCard({ label, value, icon, valueColor }) {
  return (
    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '1rem 1.25rem', position: 'relative', minHeight: 90 }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', color: '#52525b' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: valueColor || '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const firstName = user?.displayName?.split(' ')[0] || 'there'

  if (loading) return <div style={{ padding: '2.5rem', color: '#71717a', fontSize: '0.875rem' }}>Loading…</div>

  const { tasksByStatus = {}, overdueTasks = [], projects = [], adminSummary } = data || {}
  const todo = tasksByStatus['Todo'] ?? 0
  const inProgress = tasksByStatus['In Progress'] ?? 0
  const done = tasksByStatus['Done'] ?? 0
  const total = todo + inProgress + done

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.375rem' }}>OVERVIEW</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>Hi, {firstName}</h1>
        <p style={{ fontSize: '0.9375rem', color: '#71717a' }}>{todayStr()} · Here's your workspace snapshot.</p>
      </div>

      {/* Top 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="TOTAL TASKS" value={total}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
        />
        <StatCard label="MY OPEN" value={todo + inProgress} valueColor="#60a5fa"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard label="OVERDUE" value={overdueTasks.length} valueColor={overdueTasks.length > 0 ? '#f87171' : '#fff'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <StatCard label="PROJECTS" value={projects.length}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
        />
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left: Status Breakdown */}
        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>STATUS BREAKDOWN</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'TO DO', value: todo, color: '#94a3b8' },
              { label: 'IN PROGRESS', value: inProgress, color: '#60a5fa' },
              { label: 'DONE', value: done, color: '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#09090b', borderRadius: 8, padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: '0.6875rem', color: '#52525b', marginTop: '0.25rem' }}>tasks</div>
                <div style={{ height: 3, background: '#27272a', borderRadius: 2, marginTop: '0.75rem' }}>
                  <div style={{ height: '100%', width: total > 0 ? `${Math.round((value / total) * 100)}%` : '0%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* My Open Tasks */}
          <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>MY OPEN TASKS</span>
              <Link to="/my-tasks" style={{ fontSize: '0.8125rem', color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>
            {todo + inProgress === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Nothing on your plate — enjoy the quiet.
              </p>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#71717a' }}>
                You have <span style={{ color: '#60a5fa', fontWeight: 600 }}>{todo + inProgress}</span> open task{todo + inProgress !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Overdue Radar */}
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>OVERDUE RADAR</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            {overdueTasks.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#52525b' }}>No overdue tasks.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {overdueTasks.slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#f87171' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>RECENT PROJECTS</div>
            {projects.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#52525b' }}>No projects yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {projects.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#71717a', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'}
                    onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#52525b', flexShrink: 0 }}>{p.incompleteTaskCount}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Overview */}
      {adminSummary && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.875rem' }}>ADMIN OVERVIEW — ALL PROJECTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'TOTAL TO DO', value: adminSummary.tasksByStatus?.['Todo'] ?? 0 },
              { label: 'TOTAL IN PROGRESS', value: adminSummary.tasksByStatus?.['In Progress'] ?? 0, color: '#60a5fa' },
              { label: 'TOTAL DONE', value: adminSummary.tasksByStatus?.['Done'] ?? 0, color: '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: color || '#fff', letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
