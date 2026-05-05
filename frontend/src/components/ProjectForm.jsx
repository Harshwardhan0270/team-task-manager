import { useState } from 'react'
import { projectsService } from '../services/projects'

export default function ProjectForm({ project, onSuccess, onCancel }) {
  const isEdit = Boolean(project)
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = []
    if (!name.trim()) errs.push('Name is required')
    if (errs.length) { setErrors(errs); return }

    setSubmitting(true)
    setErrors([])
    try {
      if (isEdit) {
        await projectsService.update(project.id, { name: name.trim(), description: description.trim() })
      } else {
        await projectsService.create({ name: name.trim(), description: description.trim() })
      }
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
        <label htmlFor="proj-name">Name *</label>
        <input
          id="proj-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={255}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="proj-desc">Description</label>
        <textarea
          id="proj-desc"
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
