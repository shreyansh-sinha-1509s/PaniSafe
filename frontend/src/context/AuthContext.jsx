import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser, adminLogin, adminLogout, fetchAdminMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('panisafe_auth_token') || localStorage.getItem('panisafe_admin_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    try {
      adminLogout();
    } catch {}
    localStorage.removeItem('panisafe_auth_token');
    localStorage.removeItem('panisafe_admin_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      const activeToken = token || localStorage.getItem('panisafe_auth_token') || localStorage.getItem('panisafe_admin_token');
      if (activeToken) {
        try {
          const adminRes = await fetchAdminMe(activeToken);
          if (adminRes.success && adminRes.admin) {
            setUser(adminRes.admin);
            setLoading(false);
            return;
          }
        } catch {}

        try {
          const res = await fetchCurrentUser(activeToken);
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
    let res;
    try {
      res = await adminLogin(email, password);
    } catch (adminErr) {
      res = await loginUser(email, password);
    }

    const authToken = res.token || res.adminToken;
    const userObj = res.admin || res.user;

    if (authToken) {
      localStorage.setItem('panisafe_auth_token', authToken);
      localStorage.setItem('panisafe_admin_token', authToken);
      setToken(authToken);
      setUser(userObj);
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

  const isAdmin = Boolean(
    user?.role === 'admin' ||
    user?.accountType === 'judge' ||
    user?.accountType === 'primary_admin' ||
    user?.email === 'admin@panisafe.in' ||
    user?.email === 'judge@panisafe.in'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin
      }}
    >
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
