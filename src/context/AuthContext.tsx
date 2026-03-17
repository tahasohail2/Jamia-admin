import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginCredentials } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_TIMEOUT = Number(import.meta.env.VITE_ADMIN_SESSION_TIMEOUT) || 1800000; // 30 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const verifyToken = useCallback(async () => {
    // Only verify if we have a stored token AND a persisted auth flag
    // This prevents hitting the server after an explicit logout
    const hasToken = !!localStorage.getItem('adminToken');
    const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!hasToken || !wasAuthenticated) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.verifyToken();
      if (response && response.user) {
        setUser(response.user);
        setLastActivity(Date.now());
      } else {
        // Server rejected the token — clean up
        setUser(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAuthenticated');
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAuthenticated');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setLastActivity(Date.now());
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Track user activity for session timeout
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Check for session timeout
  useEffect(() => {
    if (!user) return;

    const checkTimeout = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, [user, lastActivity, logout]);

  // Verify token on mount
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
