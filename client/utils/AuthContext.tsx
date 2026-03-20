import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, getToken, setTokens, clearTokens, type AuthTokens } from './AuthApi';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthTokens>;
  logout: () => void;
  handleOAuthCallback: (token: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());

  useEffect(() => {
    // Check token on app load
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const authTokens = await login(email, password);
    setIsAuthenticated(true);
    return authTokens;
  };

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  const handleOAuthCallback = (token: string, refreshToken?: string) => {
    setTokens(token, refreshToken);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login: handleLogin, logout: handleLogout, handleOAuthCallback }}
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
