import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, Loader2, X, Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageTeam() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMembers = () => {
    api.get('/users')
      .then(res => setMembers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    try {
      await api.post('/users/invite', { email });
      toast.success('User invited!');
      setEmail('');
      setShowInvite(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite');
    } finally { setSaving(false); }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Member removed');
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchMembers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="card empty-state" style={{ padding: 60 }}>
        <div className="empty-icon">🔒</div>
        <div className="empty-title">Access Denied</div>
        <div className="empty-text">Only admins can manage team members.</div>
      </div>
    );
  }

  if (loading) return (
    <div className="empty-state">
      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="animate-slide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>Manage Team</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Add or remove team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {members.map((m, i) => (
          <div key={m._id} className="member-card">
            <div className="user-avatar" style={{ width: 42, height: 42, fontSize: 16, background: COLORS[i % COLORS.length] }}>
              {m.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
            </div>
            <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
              {m.role === 'admin' ? 'Admin' : 'Member'}
            </span>
            {m._id !== user._id && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-icon btn-sm" title="Toggle role" onClick={() => toggleRole(m._id, m.role)}>
                  {m.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                </button>
                <button className="btn btn-danger btn-icon btn-sm" title="Remove" onClick={() => handleRemove(m._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Invite Member</h3>
              <button className="modal-close" onClick={() => setShowInvite(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Inviting...' : 'Send Invite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
