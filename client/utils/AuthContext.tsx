import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  FC,
} from "react";
import { getToken, clearTokens, authAPI, setTokens } from "./AuthApi";

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  handleOAuthCallback: (
    token: string,
    refreshToken: string,
    userData: User
  ) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔹 Initialize auth from localStorage on app load
   */
  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearTokens();
        setUser(null);
      }
    }

    setIsAuthInitialized(true);
  }, []);

  /**
   * 🔹 Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      clearTokens();
      setIsLoading(false);
    }
  }, []);

  /**
   * 🔹 Email / Password login
   */
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await authAPI.login(email, password);
  
      if (!response.success) {
        setError(response.error?.message || "Login failed");
        return false;
      }
  
      // ✅ map API response correctly
      const userData: User = {
        userId: response.data.userId,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profileImage: response.data.profileImage,
      };
  
      // ✅ STORE TOKENS (CRITICAL)
      setTokens(response.data.token, response.data.refreshToken);
  
      // ✅ SET USER (this flips isAuthenticated → true)
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
  
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔹 Register
   */
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await authAPI.register(name, email, password);
      if (response.success) return true;

      setError(response.error?.message || "Registration failed");
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔹 OAuth callback (Google / Facebook)
   */
  const handleOAuthCallback = (
    token: string,
    refreshToken: string,
    userData: User
  ) => {
    setTokens(token, refreshToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthInitialized,
        isLoading,
        error,
        login,
        register,
        handleOAuthCallback,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
