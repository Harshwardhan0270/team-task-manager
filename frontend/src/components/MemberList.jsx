import { useState } from 'react'
import { projectsService } from '../services/projects'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function MemberList({ projectId, members, isAdmin, onMembersChange }) {
  const [addUserId, setAddUserId] = useState('')
  const [addError, setAddError] = useState(null)
  const [addLoading, setAddLoading] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    const uid = addUserId.trim()
    if (!uid) { setAddError('User ID is required'); return }
    const parsed = parseInt(uid, 10)
    if (isNaN(parsed) || parsed <= 0) { setAddError('Enter a valid numeric User ID'); return }
    setAddLoading(true); setAddError(null)
    try {
      await projectsService.addMember(projectId, parsed)
      setAddUserId('')
      onMembersChange()
    } catch (err) {
      setAddError(err.response?.data?.error ?? 'Failed to add member')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemove(userId) {
    if (!window.confirm('Remove this member from the project?')) return
    try { await projectsService.removeMember(projectId, userId); onMembersChange() }
    catch (err) { alert(err.response?.data?.error ?? 'Failed to remove member') }
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
          Team Members
        </h2>
        <span className="badge badge-member">{members.length} member{members.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card" style={{ padding: '0.5rem 0' }}>
        <ul className="member-list" style={{ marginBottom: 0 }}>
          {members.map(m => (
            <li key={m.userId} className="member-item" style={{ padding: '0.75rem 1.25rem' }}>
              <div className="member-item__avatar">{getInitials(m.displayName)}</div>
              <div className="member-item__info">
                <div className="member-item__name">{m.displayName}</div>
              </div>
              <span className={`badge ${m.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
                {m.role}
              </span>
              {isAdmin && m.role !== 'Admin' && (
                <button
                  className="btn-ghost"
                  style={{ minHeight: '36px', padding: '0.25rem 0.75rem', fontSize: '0.8125rem', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => handleRemove(m.userId)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {isAdmin && (
          <form onSubmit={handleAdd} noValidate style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.625rem' }}>
              Add Member by User ID
            </p>
            {addError && <p className="form-error" role="alert" style={{ marginBottom: '0.5rem' }}>{addError}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                placeholder="User ID"
                value={addUserId}
                onChange={e => setAddUserId(e.target.value)}
                style={{ minHeight: '40px', padding: '0.375rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', width: '140px', fontFamily: 'inherit' }}
                aria-label="User ID to add"
              />
              <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0, minHeight: '40px', padding: '0.375rem 1rem', fontSize: '0.875rem' }} disabled={addLoading}>
                {addLoading ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
