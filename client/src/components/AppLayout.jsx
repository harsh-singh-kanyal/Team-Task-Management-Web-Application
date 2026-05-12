import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Grid, Layers, ListTodo, UsersRound, Shield, LogOut, Menu, X } from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Grid },
    { path: '/projects', label: 'Projects', icon: Layers },
    { path: '/tasks', label: 'My Tasks', icon: ListTodo },
    { path: '/team', label: 'Team', icon: UsersRound },
  ];

  const adminItems = [
    { path: '/manage-team', label: 'Manage Team', icon: Shield },
  ];

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return { title: 'Dashboard', sub: 'Overview of your workspace' };
    if (p.startsWith('/projects/')) return { title: 'Project Board', sub: 'Manage tasks in this project' };
    if (p.startsWith('/projects')) return { title: 'Projects', sub: 'All your projects' };
    if (p.startsWith('/tasks')) return { title: 'My Tasks', sub: 'Tasks assigned to you' };
    if (p.startsWith('/team')) return { title: 'Team', sub: 'Your team members' };
    if (p.startsWith('/manage-team')) return { title: 'Manage Team', sub: 'Admin panel' };
    return { title: 'Ethara', sub: '' };
  };

  const page = getPageTitle();

  return (
    <div className="app-layout">
      {sidebarOpen && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">E</div>
          <span className="sidebar-brand">Ethara - Team Task Manager</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-label">Admin</div>
              {adminItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="nav-icon" />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role === 'admin' ? 'Admin' : 'Member'}</div>
          </div>
          <button className="btn-ghost btn-icon" onClick={logout} title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <div className="topbar-title">{page.title}</div>
              {page.sub && <div className="topbar-subtitle">{page.sub}</div>}
            </div>
          </div>
          <div className="topbar-right">
            <div className="user-avatar" style={{width:32,height:32,fontSize:13}}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <div className="page-container animate-fade">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
