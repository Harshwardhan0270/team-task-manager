import { useState } from 'react'
import { tasksService } from '../services/tasks'

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done']

function statusBadgeClass(status) {
  if (status === 'Todo') return 'badge badge-todo'
  if (status === 'In Progress') return 'badge badge-in-progress'
  if (status === 'Done') return 'badge badge-done'
  return 'badge badge-todo'
}

function priorityBadgeClass(priority) {
  if (priority === 'Low') return 'badge badge-low'
  if (priority === 'Medium') return 'badge badge-medium'
  if (priority === 'High') return 'badge badge-high'
  return ''
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function TaskCard({ task, projectId, isAdmin, currentUserId, onStatusChange }) {
  const [status, setStatus] = useState(task.status)
  const [updating, setUpdating] = useState(false)
  const canChangeStatus = isAdmin || task.assigneeId === currentUserId

  async function handleStatusChange(e) {
    const newStatus = e.target.value
    setUpdating(true)
    try {
      await tasksService.updateStatus(projectId, task.id, newStatus)
      setStatus(newStatus)
      if (onStatusChange) onStatusChange()
    } catch (err) {
      alert(err.response?.data?.error ?? 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="card task-card">
      <div className="task-card__header">
        <span className="task-card__title">{task.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {task.priority && <span className={priorityBadgeClass(task.priority)}>{task.priority}</span>}
          {canChangeStatus ? (
            <select
              className="status-select"
              value={status}
              onChange={handleStatusChange}
              disabled={updating}
              aria-label="Task status"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span className={statusBadgeClass(status)}>{status}</span>
          )}
        </div>
      </div>

      <div className="task-card__meta">
        {task.assigneeDisplayName && (
          <span className="task-card__meta-item">
            <span className="task-card__avatar">{getInitials(task.assigneeDisplayName)}</span>
            {task.assigneeDisplayName}
          </span>
        )}
        {task.dueDate && (
          <span className="task-card__meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {task.dueDate}
          </span>
        )}
      </div>
    </div>
  )
}
