import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const STATUS_COLORS = {
  'Todo': { bg: 'rgba(71,85,105,0.3)', text: '#94a3b8', dot: '#64748b' },
  'In Progress': { bg: 'rgba(29,78,216,0.15)', text: '#60a5fa', dot: '#3b82f6' },
  'Done': { bg: 'rgba(21,128,61,0.15)', text: '#4ade80', dot: '#22c55e' },
}
const PRIORITY_COLORS = {
  low: { bg: '#27272a', text: '#a1a1aa' },
  medium: { bg: 'rgba(29,78,216,0.15)', text: '#60a5fa' },
  high: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

function formatDate(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Done') return false
  return new Date(dueDate) < new Date()
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/users/me/tasks')
      .then(r => { setTasks(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => {
    if (filter === 'open') return t.status !== 'Done'
    if (filter === 'done') return t.status === 'Done'
    if (filter === 'overdue') return isOverdue(t.due_date, t.status)
    return true
  })

  const counts = {
    all: tasks.length,
    open: tasks.filter(t => t.status !== 'Done').length,
    done: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(t => isOverdue(t.due_date, t.status)).length,
  }

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2.5rem)' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Workspace</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>My Tasks</h1>
      <p style={{ fontSize: '0.875rem', color: '#71717a', marginBottom: '1.5rem' }}>All tasks assigned to you</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #27272a', paddingBottom: 0 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'done', label: 'Done' },
          { key: 'overdue', label: 'Overdue' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '0.5rem 1rem', background: 'none', border: 'none',
            borderBottom: filter === key ? '2px solid #6366f1' : '2px solid transparent',
            marginBottom: -1, color: filter === key ? '#a5b4fc' : '#71717a',
            fontWeight: filter === key ? 700 : 500, fontSize: '0.875rem',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s',
          }}>
            {label} <span style={{ fontSize: '0.75rem', color: '#52525b' }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
          <div style={{ fontWeight: 600, color: '#71717a' }}>No tasks here</div>
        </div>
      ) : (
        <div style={{ border: '1px solid #27272a', borderRadius: 8, overflow: 'hidden', background: '#18181b' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto',
            padding: '0.625rem 1rem', borderBottom: '1px solid #27272a',
            fontSize: '0.6875rem', fontWeight: 700, color: '#71717a',
            textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>
            <div>Task</div><div>Project</div><div>Due</div><div>Status</div>
          </div>
          {filtered.map((t, i) => {
            const sc = STATUS_COLORS[t.status] || STATUS_COLORS['Todo']
            const pc = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.medium
            const overdue = isOverdue(t.due_date, t.status)
            return (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                padding: '0.75rem 1rem', gap: '1rem',
                borderBottom: i < filtered.length - 1 ? '1px solid #27272a' : 'none',
                alignItems: 'center', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#0f0f11'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#e4e4e7', fontWeight: 500, marginBottom: '0.25rem' }}>{t.title}</div>
                  {t.priority && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.15em 0.5em', borderRadius: 4, background: pc.bg, color: pc.text }}>
                      {t.priority}
                    </span>
                  )}
                </div>
                <Link to={`/projects/${t.project_id}`} style={{
                  fontSize: '0.8125rem', color: '#71717a', textDecoration: 'none',
                  whiteSpace: 'nowrap', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                  onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                >
                  {t.project_name}
                </Link>
                <div style={{ fontSize: '0.8125rem', color: overdue ? '#f87171' : '#71717a', whiteSpace: 'nowrap' }}>
                  {formatDate(t.due_date) || '—'}
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2em 0.6em', borderRadius: 9999,
                  fontSize: '0.75rem', fontWeight: 600,
                  background: sc.bg, color: sc.text, whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                  {t.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
