import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { tasksService } from '../services/tasks'
import { projectsService } from '../services/projects'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done']

export default function Tasks() {
  const { id: projectId } = useParams()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  const isAdmin = members.some(m => m.userId === user?.id && m.role === 'Admin')

  async function fetchMembers() {
    try { setMembers(await projectsService.getMembers(projectId)) } catch {}
  }

  async function fetchTasks() {
    setLoading(true); setError(null)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (assigneeFilter) params.assignee = assigneeFilter
      setTasks(await tasksService.getAll(projectId, params))
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [projectId])
  useEffect(() => { fetchTasks() }, [projectId, statusFilter, assigneeFilter])

  return (
    <div className="page">
      <Link to={`/projects/${projectId}`} className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Project
      </Link>

      <div className="section-header">
        <div className="page-title">Tasks</div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="form-group">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="filter-assignee">Assignee</label>
          <select id="filter-assignee" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
            <option value="">All Assignees</option>
            {members.map(m => <option key={m.userId} value={m.userId}>{m.displayName}</option>)}
          </select>
        </div>
        {(statusFilter || assigneeFilter) && (
          <button className="btn-ghost" style={{ minHeight: '40px', alignSelf: 'flex-end', fontSize: '0.875rem' }} onClick={() => { setStatusFilter(''); setAssigneeFilter('') }}>
            Clear filters
          </button>
        )}
      </div>

      {loading && <p className="text-muted">Loading tasks…</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && tasks.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state__icon">🔍</div>
          <div className="empty-state__title">No tasks found</div>
          <div className="empty-state__desc">Try adjusting your filters or add new tasks from the project page.</div>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} projectId={projectId} isAdmin={isAdmin} currentUserId={user?.id} onStatusChange={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  )
}
