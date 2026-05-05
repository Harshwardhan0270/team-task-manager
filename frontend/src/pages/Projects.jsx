import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectsService } from '../services/projects'
import { useAuth } from '../context/AuthContext'

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ProjectForm({ project, onSuccess, onCancel }) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      if (project) await projectsService.update(project.id, { name: name.trim(), description: description.trim() })
      else await projectsService.create({ name: name.trim(), description: description.trim() })
      onSuccess()
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.details?.[0] || 'Failed')
    } finally { setSaving(false) }
  }

  const inputStyle = { width: '100%', background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', fontSize: '0.9375rem', padding: '0.5rem 0.75rem', fontFamily: 'inherit', outline: 'none', marginTop: '0.375rem' }
  const labelStyle = { display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.15em' }

  return (
    <form onSubmit={submit}>
      {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#fca5a5', fontSize: '0.875rem', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={labelStyle}>Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" style={inputStyle} />
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Optional description" style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #3f3f46', borderRadius: 6, color: '#a1a1aa', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1.25rem', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const isGlobalAdmin = user?.role?.toLowerCase() === 'admin'
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => projectsService.getAll().then(setProjects).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try { await projectsService.delete(id); setProjects(p => p.filter(x => x.id !== id)) }
    catch (e) { alert(e.response?.data?.error || 'Failed to delete') }
  }

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2.5rem)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.375rem' }}>Workspace</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: '0.25rem' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isGlobalAdmin && (
          <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Loading…</p>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#52525b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📁</div>
          <div style={{ fontWeight: 600, color: '#71717a', marginBottom: '0.375rem' }}>No projects yet</div>
          <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Create your first project to get started.</div>
          {isGlobalAdmin && <button onClick={() => setShowNew(true)} style={{ padding: '0.5rem 1.25rem', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Create Project</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {projects.map(p => (
            <div key={p.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 10, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3f3f46'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
            >
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e4e4e7' }}>{p.name}</div>
              {p.description && <p style={{ fontSize: '0.8125rem', color: '#71717a', lineHeight: 1.5, flex: 1 }}>{p.description}</p>}
              <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.25rem' }}>Created {formatDate(p.createdAt)}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #27272a' }}>
                <Link to={`/projects/${p.id}`} style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0.75rem', background: '#2563eb', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                >Open</Link>
                {isGlobalAdmin && <>
                  <button onClick={() => setEditing(p)} style={{ padding: '0.4rem 0.75rem', background: 'transparent', border: '1px solid #3f3f46', borderRadius: 6, color: '#a1a1aa', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '0.4rem 0.75rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, color: '#f87171', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && <Modal title="New Project" onClose={() => setShowNew(false)}><ProjectForm onSuccess={() => { setShowNew(false); load() }} onCancel={() => setShowNew(false)} /></Modal>}
      {editing && <Modal title="Edit Project" onClose={() => setEditing(null)}><ProjectForm project={editing} onSuccess={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} /></Modal>}
    </div>
  )
}
