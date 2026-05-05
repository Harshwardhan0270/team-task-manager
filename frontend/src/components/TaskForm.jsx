import { useState } from 'react'
import { tasksService } from '../services/tasks'

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

export default function TaskForm({ projectId, members, onSuccess, onCancel }) {
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState(members[0]?.userId ?? '')
  const [status, setStatus] = useState('Todo')
  const [priority, setPriority] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = []
    if (!title.trim()) errs.push('Title is required')
    if (!assigneeId) errs.push('Assignee is required')
    if (errs.length) { setErrors(errs); return }

    const payload = {
      title: title.trim(),
      assigneeId: Number(assigneeId),
      status,
      ...(priority && { priority }),
      ...(dueDate && { dueDate }),
      ...(description.trim() && { description: description.trim() }),
    }

    setSubmitting(true)
    setErrors([])
    try {
      await tasksService.create(projectId, payload)
      onSuccess()
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Something went wrong'
      const details = err.response?.data?.details ?? []
      setErrors(details.length ? details : [msg])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.length > 0 && (
        <ul className="form-error-list" role="alert">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      <div className="form-group">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={255}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-assignee">Assignee *</label>
        <select
          id="task-assignee"
          value={assigneeId}
          onChange={e => setAssigneeId(e.target.value)}
          required
        >
          <option value="">Select assignee…</option>
          {members.map(m => (
            <option key={m.userId} value={m.userId}>{m.displayName}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-priority">Priority</label>
        <select
          id="task-priority"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="">None</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-due">Due Date</label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: 'auto' }}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}
