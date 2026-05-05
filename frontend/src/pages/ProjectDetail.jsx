import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const COLUMNS = [
  { key: 'Todo', label: 'To do', dot: '#64748b' },
  { key: 'In Progress', label: 'In Progress', dot: '#f59e0b' },
  { key: 'Done', label: 'Done', dot: '#22c55e' },
]

const PRIORITY_STYLE = {
  low: { bg: '#27272a', text: '#a1a1aa' },
  medium: { bg: 'rgba(29,78,216,0.15)', text: '#60a5fa' },
  high: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Done') return false
  return new Date(dueDate) < new Date()
}

// ── Task Card ──────────────────────────────────────────────────────────────
function KanbanCard({ task, onMove, onDelete, onOpen, isAdmin, currentUserId }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const overdue = isOverdue(task.due_date, task.status)
  const pc = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium
  const canEdit = isAdmin || task.assignee_id === currentUserId

  return (
    <div
      onClick={() => onOpen(task)}
      style={{
        background: '#18181b', border: '1px solid #27272a', borderRadius: 8,
        padding: '0.75rem', cursor: 'pointer', transition: 'border-color 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#52525b'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e4e4e7', lineHeight: 1.4, flex: 1 }}>{task.title}</div>
        {canEdit && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
              style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
            >⋯</button>
            {menuOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', right: 0, top: '100%', zIndex: 50,
                  background: '#18181b', border: '1px solid #27272a', borderRadius: 6,
                  minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {COLUMNS.filter(c => c.key !== task.status).map(c => (
                  <button key={c.key} onClick={() => { onMove(task.id, c.key); setMenuOpen(false) }}
                    style={{ display: 'block', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', color: '#a1a1aa', fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >Move to {c.label}</button>
                ))}
                {isAdmin && (
                  <button onClick={() => { onDelete(task.id); setMenuOpen(false) }}
                    style={{ display: 'block', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', color: '#f87171', fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', borderTop: '1px solid #27272a' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >Delete</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <div style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {task.priority && (
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.15em 0.5em', borderRadius: 4, background: pc.bg, color: pc.text }}>
            {task.priority}
          </span>
        )}
        {task.due_date && (
          <span style={{ fontSize: '0.6875rem', padding: '0.15em 0.5em', borderRadius: 4, background: overdue ? 'rgba(239,68,68,0.15)' : '#27272a', color: overdue ? '#f87171' : '#71717a' }}>
            📅 {formatDate(task.due_date)}
          </span>
        )}
        {task.assigneeDisplayName && (
          <div style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#fff' }}>
            {getInitials(task.assigneeDisplayName)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Create Task Modal ──────────────────────────────────────────────────────
function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '', status: 'Todo', priority: 'medium', dueDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: form.title, description: form.description,
        assigneeId: Number(form.assigneeId), status: form.status,
        priority: form.priority.charAt(0).toUpperCase() + form.priority.slice(1),
        dueDate: form.dueDate || undefined,
      })
      onCreated()
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.details?.[0] || 'Failed to create task')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>Create task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>✕</button>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#fca5a5', fontSize: '0.875rem', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={submit}>
          {[
            { label: 'Title *', key: 'title', type: 'text', placeholder: 'Task title' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: '0.875rem' }}>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.9375rem', padding: '0.5rem 0.75rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>
          ))}
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.9375rem', padding: '0.5rem 0.75rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>Assignee</label>
              <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.875rem', padding: '0.5rem 0.625rem', fontFamily: 'inherit', outline: 'none' }}>
                <option value="">Select…</option>
                {members.map(m => <option key={m.userId} value={m.userId}>{m.displayName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.875rem', padding: '0.5rem 0.625rem', fontFamily: 'inherit', outline: 'none' }}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.875rem', padding: '0.5rem 0.625rem', fontFamily: 'inherit', outline: 'none' }}>
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                style={{ width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.875rem', padding: '0.5rem 0.625rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #3f3f46', borderRadius: 6, color: '#a1a1aa', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '0.5rem 1.25rem', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id: projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [openTask, setOpenTask] = useState(null)

  const isAdmin = members.some(m => m.userId === user?.id && m.role === 'Admin')

  async function loadAll() {
    try {
      const [tasksRes, membersRes, projectsRes] = await Promise.all([
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/members`),
        api.get('/projects'),
      ])
      setTasks(tasksRes.data)
      setMembers(membersRes.data)
      const proj = projectsRes.data.find(p => String(p.id) === String(projectId))
      if (proj) setProject(proj)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [projectId])

  const grouped = useMemo(() => {
    const g = { 'Todo': [], 'In Progress': [], 'Done': [] }
    tasks.forEach(t => { if (g[t.status]) g[t.status].push(t) })
    return g
  }, [tasks])

  async function moveTask(taskId, newStatus) {
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus })
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (e) { alert(e.response?.data?.error || 'Failed to move task') }
  }

  async function deleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`)
      setTasks(ts => ts.filter(t => t.id !== taskId))
      if (openTask?.id === taskId) setOpenTask(null)
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete task') }
  }

  if (loading) return <div style={{ padding: '2.5rem', color: '#71717a', fontSize: '0.875rem' }}>Loading…</div>

  return (
    <div style={{ padding: '2.5rem', minHeight: '100vh' }}>
      {/* Back */}
      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#71717a', textDecoration: 'none', marginBottom: '1rem', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to projects
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.375rem' }}>Project</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{project?.name || `Project #${projectId}`}</h1>
          {project?.description && <p style={{ fontSize: '0.875rem', color: '#71717a', maxWidth: 600 }}>{project.description}</p>}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#71717a' }}>
            <span>👥 {members.length} members</span>
            <span>📋 {tasks.length} tasks</span>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1rem', background: '#2563eb', border: 'none',
            borderRadius: 6, color: '#fff', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Task
          </button>
      </div>

      {/* Kanban */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
        {COLUMNS.map(col => (
          <div key={col.key} style={{ flexShrink: 0, width: 300, background: '#0f0f11', border: '1px solid #27272a', borderRadius: 10, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.25rem 0.5rem', borderBottom: '1px solid #27272a', marginBottom: '0.25rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{col.label}</span>
              <span style={{ fontSize: '0.75rem', color: '#52525b', marginLeft: 'auto' }}>({grouped[col.key].length})</span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 80 }}>
              {grouped[col.key].map(task => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onMove={moveTask}
                  onDelete={deleteTask}
                  onOpen={setOpenTask}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                />
              ))}
              {grouped[col.key].length === 0 && (
                <div style={{ border: '1px dashed #27272a', borderRadius: 6, padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#52525b' }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadAll() }}
        />
      )}

      {/* Task detail modal */}
      {openTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Task</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{openTask.title}</h2>
              </div>
              <button onClick={() => setOpenTask(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>✕</button>
            </div>

            {openTask.description && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.375rem' }}>Description</div>
                <p style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.6 }}>{openTask.description}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { label: 'Status', value: openTask.status },
                { label: 'Priority', value: openTask.priority || '—' },
                { label: 'Assignee', value: openTask.assigneeDisplayName || '—' },
                { label: 'Due Date', value: formatDate(openTask.due_date) || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#09090b', borderRadius: 6, padding: '0.625rem 0.75rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', color: '#e4e4e7', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {(isAdmin || openTask.assignee_id === user?.id) && (
                <button onClick={() => { deleteTask(openTask.id); setOpenTask(null) }}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#f87171', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Delete
                </button>
              )}
              <button onClick={() => setOpenTask(null)}
                style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', borderRadius: 6, color: '#e4e4e7', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
