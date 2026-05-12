import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, ArrowRight, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#f43f5e', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = () => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', color: COLORS[0] });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="empty-state">
      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="animate-slide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>Projects</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state" style={{ padding: 80 }}>
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-text">Create your first project to start organizing tasks with your team.</div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {projects.map(p => {
            const total = p.taskCount || 0;
            const done = p.doneCount || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="project-name">
                  <span className="project-color" style={{ background: p.color || '#8b5cf6' }} />
                  {p.name}
                </div>
                <div className="project-desc">{p.description || 'No description'}</div>
                <div className="project-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="progress-text">
                    <span>{done}/{total} tasks</span>
                    <span>{pct}%</span>
                  </div>
                </div>
                <div className="project-footer">
                  <div className="project-members">
                    {(p.members || []).slice(0, 4).map((m, i) => (
                      <div key={i} className="user-avatar" style={{ background: COLORS[(i + 2) % COLORS.length] }}>
                        {m.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    ))}
                    {(p.members?.length || 0) > 4 && (
                      <div className="user-avatar" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 10 }}>
                        +{p.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span style={{ color: 'var(--accent-purple-light)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input className="form-input" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COLORS.map(c => (
                      <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'transform 0.2s', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
