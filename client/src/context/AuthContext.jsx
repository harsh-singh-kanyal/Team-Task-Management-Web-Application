import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Add a timeout to prevent infinite loading if the server is slow
      const timeout = setTimeout(() => {
        console.warn('Auth check timed out, proceeding as unauthenticated');
        setLoading(false);
      }, 5000);

      api.get('/auth/me')
        .then(res => {
          clearTimeout(timeout);
          setUser(res.data.user);
          setLoading(false);
        })
        .catch((err) => {
          clearTimeout(timeout);
          // Only clear token on 401 Unauthorized, not on network/server errors
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
          }
          setLoading(false);
        });

      return () => clearTimeout(timeout);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
