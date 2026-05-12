import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, ArrowLeft, Users, X, Calendar, Flag, User, Loader2, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = [
  { key: 'todo', label: 'To Do', emoji: '📌', cls: 'todo' },
  { key: 'in_progress', label: 'In Progress', emoji: '⚡', cls: 'progress' },
  { key: 'in_review', label: 'In Review', emoji: '🔍', cls: 'review' },
  { key: 'done', label: 'Done', emoji: '✅', cls: 'done' },
];

const PRIORITIES = ['low', 'medium', 'high'];

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', assignee: '', status: 'todo' });
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, tRes, uRes] = await Promise.all([
        api.get(`/projects/${id}`), 
        api.get(`/projects/${id}/tasks`),
        api.get('/users')
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setMembers(pRes.data.members || []);
      setAllUsers(uRes.data || []);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;
    setAddingMember(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserToAdd });
      toast.success('Member added');
      setSelectedUserToAdd('');
      fetchData();
    } catch (err) { toast.error('Failed to add member'); } 
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchData();
    } catch (err) { toast.error('Failed to remove member'); }
  };

  const openCreateTask = (status = 'todo') => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', assignee: '', status });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    const isAssignee = (task.assignee?._id || task.assignee) === user?._id;
    const isAdminOrOwner = user?.role === 'admin' || project?.owner?._id === user?._id;
    if (!isAdminOrOwner && !isAssignee) {
      toast.error('You can only view/edit tasks assigned to you');
      return;
    }

    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || '', priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '', assignee: task.assignee?._id || task.assignee || '',
      status: task.status,
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, taskForm);
        toast.success('Task updated');
      } else {
        await api.post(`/projects/${id}/tasks`, taskForm);
        toast.success('Task created');
      }
      setShowTaskModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return (
    <div className="empty-state">
      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isOverdue = (d) => d && new Date(d) < new Date();

  return (
    <div className="animate-slide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/projects')}><ArrowLeft size={18} /> Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: project?.color || '#8b5cf6', display: 'inline-block' }} />
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>{project?.name}</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowMembersModal(true)}>
            <Users size={16} /> Members ({members.length})
          </button>
          {(user?.role === 'admin' || project?.owner?._id === user?._id) && (
            <button className="btn btn-primary" onClick={() => openCreateTask()}>
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>
      {project?.description && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{project.description}</p>}

      <div className="kanban-board">
        {STATUSES.map(s => {
          const colTasks = tasks.filter(t => t.status === s.key);
          return (
            <div key={s.key} className="kanban-column">
              <div className={`kanban-header ${s.cls}`}>
                <span>{s.emoji} {s.label}</span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              {colTasks.map(t => (
                <div key={t._id} className="task-card" onClick={() => openEditTask(t)}>
                  <div className="task-card-header">
                    <span className="task-title">{t.title}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(user?.role === 'admin' || project?.owner?._id === user?._id) && (
                        <button className="btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); handleDeleteTask(t._id); }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {t.description && <div className="task-desc">{t.description}</div>}
                  <div className="task-meta">
                    <span className={`badge badge-${t.priority || 'medium'}`}>
                      <Flag size={10} /> {t.priority || 'medium'}
                    </span>
                    {t.dueDate && (
                      <span className={`task-due ${isOverdue(t.dueDate) && t.status !== 'done' ? 'overdue' : ''}`}>
                        <Calendar size={12} /> {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {(t.assignee?.name || t.assigneeName) && (
                      <span className="task-assignee">
                        <span className="task-assignee-avatar">{(t.assignee?.name || t.assigneeName)?.[0]?.toUpperCase()}</span>
                        {t.assignee?.name || t.assigneeName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(user?.role === 'admin' || project?.owner?._id === user?._id) && (
                <button className="kanban-add-btn" onClick={() => openCreateTask(s.key)}>+ Add task</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</h3>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe the task..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                      {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                      <option value="">Unassigned</option>
                      {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Project Members</h3>
              <button className="modal-close" onClick={() => setShowMembersModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(user?.role === 'admin' || project?.owner?._id === user?._id) && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select 
                    className="form-select" 
                    value={selectedUserToAdd} 
                    onChange={e => setSelectedUserToAdd(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select a user to add...</option>
                    {allUsers.filter(u => !members.some(m => m._id === u._id)).map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAddMember} 
                    disabled={!selectedUserToAdd || addingMember}
                  >
                    {addingMember ? 'Adding...' : 'Add'}
                  </button>
                </div>
              )}

              {members.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No members yet</p>
              ) : members.map(m => (
                <div key={m._id} className="member-card" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="user-avatar">{m.name?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                  </div>
                  <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>{m.role || 'member'}</span>
                  
                  {(user?.role === 'admin' || project?.owner?._id === user?._id) && m._id !== project?.owner?._id && (
                    <button 
                      className="btn-ghost btn-icon btn-sm" 
                      onClick={() => handleRemoveMember(m._id)}
                      style={{ marginLeft: 8 }}
                      title="Remove Member"
                    >
                      <Trash2 size={14} color="var(--error-color)" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
