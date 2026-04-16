import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authAPI,
  login,
  getToken,
  setTokens,
  clearTokens,
  getStoredUser,
  setStoredUser,
  isTokenValid,
  getUserFromToken,
  SESSION_EXPIRED_EVENT,
  type AuthSession,
  type AuthUser,
} from './AuthApi';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => void;
  handleOAuthCallback: (token: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStoredUser(null);
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    // Don't validate token here - let API calls handle expiration
    const restoredUser = getStoredUser() ?? getUserFromToken(token);
    setStoredUser(restoredUser);
    setUser(restoredUser);
    setIsAuthenticated(true);
    void refreshAccountData();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearTokens();
      setStoredUser(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const refreshAccountData = async () => {
    try {
      await Promise.all([
        authAPI.refreshCurrentSubscription(),
        authAPI.refreshRemainingCredits(),
      ]);
    } catch (error) {
      console.error("Failed to refresh account data:", error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const authSession = await login(email, password);
    setUser(authSession.user ?? null);
    setIsAuthenticated(true);
    void refreshAccountData();
    return authSession;
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleOAuthCallback = (token: string, refreshToken?: string) => {
    setTokens(token, refreshToken);
    const nextUser = getStoredUser() ?? getUserFromToken(token);
    setStoredUser(nextUser);
    setUser(nextUser);
    setIsAuthenticated(true);
    void refreshAccountData();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login: handleLogin, logout: handleLogout, handleOAuthCallback }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
