import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const response = await api.getCurrentUser();
    if (response.data) {
      setUser(response.data.user);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // After OAuth callback redirect, check auth via cookie
    if (window.location.pathname === '/auth/callback') {
      checkAuth().then(() => {
        window.history.replaceState({}, document.title, '/');
      });
    }
  }, []);

  const login = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
