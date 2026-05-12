import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'member' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: showPass ? 'text' : 'password', icon: Lock, placeholder: 'Min 6 characters' },
    { name: 'confirmPassword', label: 'Confirm Password', type: showPass ? 'text' : 'password', icon: Lock, placeholder: 'Re-enter password' },
  ];

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="sidebar-logo" style={{ width: 48, height: 48, fontSize: 22 }}>E</div>
            <span className="sidebar-brand" style={{ fontSize: 28 }}>Ethara - Team Task Manager</span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join Ethara - Team Task Manager and start managing your projects</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div className="form-group" key={f.name}>
              <label className="form-label">{f.label}</label>
              <div style={{ position: 'relative' }}>
                <f.icon size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type={f.type}
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                />
              </div>
              {errors[f.name] && <div className="form-error">{errors[f.name]}</div>}
            </div>
          ))}
          
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-input" 
              value={form.role} 
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} /> Show password
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
