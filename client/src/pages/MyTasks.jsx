import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Calendar, Flag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'todo', 'in_progress', 'in_review', 'done'];
const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks/my')
      .then(res => setTasks(res.data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isOverdue = (d) => d && new Date(d) < new Date();

  if (loading) return (
    <div className="empty-state">
      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="animate-slide">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>My Tasks</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : STATUS_LABELS[s]}</option>)}
        </select>
        <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'all' ? 'All priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: 60 }}>
          <div className="empty-icon">✅</div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-text">Tasks assigned to you will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => (
            <div key={t._id} className="task-card" style={{ cursor: 'default' }}>
              <div className="task-card-header">
                <div>
                  <span className="task-title">{t.title}</span>
                  {t.projectName && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>in {t.projectName}</span>
                  )}
                </div>
                <select
                  className="filter-select"
                  value={t.status}
                  onChange={e => handleStatusChange(t._id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 12, padding: '4px 8px' }}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {t.description && <div className="task-desc">{t.description}</div>}
              <div className="task-meta">
                <span className={`badge badge-${t.status?.replace('_', '') || 'todo'}`}>
                  {STATUS_LABELS[t.status] || t.status}
                </span>
                <span className={`badge badge-${t.priority || 'medium'}`}>
                  <Flag size={10} /> {t.priority || 'medium'}
                </span>
                {t.dueDate && (
                  <span className={`task-due ${isOverdue(t.dueDate) && t.status !== 'done' ? 'overdue' : ''}`}>
                    <Calendar size={12} /> {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
