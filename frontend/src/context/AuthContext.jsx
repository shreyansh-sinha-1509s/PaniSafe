import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('panisafe_auth_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('panisafe_auth_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await fetchCurrentUser(token);
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.token) {
      localStorage.setItem('panisafe_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (fullName, email, password, organization) => {
    const res = await registerUser(fullName, email, password, organization);
    if (res.token) {
      localStorage.setItem('panisafe_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user, isAdmin: Boolean(user?.role === 'admin' || user?.email === 'admin@panisafe.in' || user?.email === 'judge@panisafe.in') }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
