import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Loader2, FolderKanban, Users, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = ['#8b5cf6', '#f59e0b', '#06b6d4', '#10b981'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats').catch(() => ({ data: { totalTasks: 0, todoTasks: 0, inProgressTasks: 0, inReviewTasks: 0, doneTasks: 0, overdueTasks: 0, totalProjects: 0, totalMembers: 0, tasksByUser: [] } })),
      api.get('/tasks').catch(() => ({ data: [] })),
      api.get('/projects').catch(() => ({ data: [] }))
    ]).then(([resStats, resTasks, resProj]) => {
      setStats(resStats.data);
      setTasks(resTasks.data.slice(0, 4)); // Get top 4 tasks
      setProjects(resProj.data.slice(0, 3)); // Get top 3 projects
      setLoading(false);
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="empty-state">
      <Loader2 size={40} className="nav-icon" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading dashboard...</p>
    </div>
  );

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'purple', path: '/tasks' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: Clock, color: 'amber', path: '/tasks' },
    { label: 'Completed', value: stats?.doneTasks || 0, icon: TrendingUp, color: 'emerald', path: '/tasks' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: 'rose', path: '/tasks' },
    { label: 'Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'cyan', path: '/projects' },
    { label: 'Team Members', value: stats?.totalMembers || 0, icon: Users, color: 'purple', path: '/team' },
  ];

  const pieData = [
    { name: 'To Do', value: stats?.todoTasks || 0 },
    { name: 'In Progress', value: stats?.inProgressTasks || 0 },
    { name: 'In Review', value: stats?.inReviewTasks || 0 },
    { name: 'Done', value: stats?.doneTasks || 0 },
  ].filter(d => d.value > 0);

  const barData = stats?.tasksByUser || [];

  return (
    <div className="animate-slide">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>
          {getGreeting()}, <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Here's what's happening in your workspace today.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <Link key={i} to={s.path} className={`stat-card ${s.color}`} style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none', display: 'block' }}>
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>My Tasks</h3>
            <Link to="/tasks" style={{ fontSize: 13, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {tasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tasks.map(t => (
                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-default)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t.project?.name || 'No project'}</div>
                  </div>
                  <span className={`status-badge status-${t.status.replace(' ', '-').toLowerCase()}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks found.</div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Projects</h3>
            <Link to="/projects" style={{ fontSize: 13, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {projects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map(p => (
                <div key={p._id} style={{ padding: 16, background: 'var(--bg-default)', borderRadius: 8, borderLeft: `4px solid ${p.color || 'var(--primary-color)'}` }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{p.description || 'No description'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No projects found.</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>
        {pieData.length > 0 && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        )}

        {barData.length > 0 && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Tasks per Member</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="tasks" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
