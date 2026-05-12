import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2 } from 'lucide-react';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then(res => setMembers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];

  if (loading) return (
    <div className="empty-state">
      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="animate-slide">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>Team Members</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>

      {members.length === 0 ? (
        <div className="card empty-state" style={{ padding: 60 }}>
          <div className="empty-icon">👥</div>
          <div className="empty-title">No team members</div>
          <div className="empty-text">Team members will appear here once they join.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {members.map((m, i) => (
            <div key={m._id} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 18, background: COLORS[i % COLORS.length], flexShrink: 0 }}>
                {m.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
              </div>
              <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                {m.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
