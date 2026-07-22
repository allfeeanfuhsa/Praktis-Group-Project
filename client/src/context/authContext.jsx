import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardByRole } from '../utils/roleHelper';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Session Hydration: Validate session against server on app load
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        // Clean up legacy localStorage keys to eliminate security vulnerabilities
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        const response = await api.get('/api/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  // 2. Login Function
  const login = (newToken, userData) => {
    // Purge disk storage — session is authenticated via HttpOnly cookie
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(userData);

    // --- SMART REDIRECT LOGIC ---
    const roles = userData.roles || [];

    if (roles.includes('admin')) {
      navigate('/admin/dashboard');
      return;
    }

    if (roles.length > 1) {
      navigate('/auth/role-selection');
      return;
    }

    const targetPath = getDashboardByRole(roles);
    navigate(targetPath);
  };

  // 3. Logout Function — clears server-side HttpOnly cookie
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token: user ? 'cookie-active' : null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);