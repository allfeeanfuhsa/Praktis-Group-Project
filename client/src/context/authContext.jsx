import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { getDashboardByRole } from '../utils/roleHelper'; // Import the helper

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from LocalStorage if available to prevent "flicker" on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  // 1. Check Token Expiry on Load
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  }, [token]);

  // 2. Login Function
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    // --- SMART REDIRECT LOGIC ---
    const roles = userData.roles || [];

    // Special Case: Admin usually skips selection (optional, depends on your pref)
    if (roles.includes('admin')) {
      navigate('/admin/dashboard');
      return;
    }

    // Special Case: Multiple Roles -> Go to Selection Page
    if (roles.length > 1) {
      navigate('/auth/role-selection');
      return;
    }

    // Standard Case: Single Role -> Use Helper
    const targetPath = getDashboardByRole(roles);
    navigate(targetPath);
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);