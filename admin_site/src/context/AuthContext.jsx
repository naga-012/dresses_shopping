import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('saha_admin_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('saha_admin_token');
      const storedUser = localStorage.getItem('saha_admin_user');
      
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'admin') {
            setAdmin(parsed);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: userToken, role, name, email: userEmail, _id } = res.data;

      if (role !== 'admin') {
        throw new Error('Access Denied — Admin Permission Required');
      }

      const userData = { _id, name, email: userEmail, role };
      setAdmin(userData);
      setToken(userToken);

      if (rememberMe) {
        localStorage.setItem('saha_admin_token', userToken);
        localStorage.setItem('saha_admin_user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('saha_admin_token', userToken);
        sessionStorage.setItem('saha_admin_user', JSON.stringify(userData));
      }

      toast.success(`Welcome back, ${name || 'Admin'}!`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken('');
    localStorage.removeItem('saha_admin_token');
    localStorage.removeItem('saha_admin_user');
    sessionStorage.removeItem('saha_admin_token');
    sessionStorage.removeItem('saha_admin_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, isAdmin: admin?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
