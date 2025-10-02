import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ requiresTwoFactor?: boolean }>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  login: string;
  password: string;
  twoFactorCode?: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();

    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true };
    }

    setUser(data.user);
    return {};
  };

  const register = async (userData: RegisterData) => {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    await apiRequest('POST', '/api/auth/logout');
    setUser(null);
  };

  const verify2FA = async (code: string) => {
    const response = await apiRequest('POST', '/api/auth/verify-2fa-login', { code });
    const data = await response.json();
    setUser(data.user);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    verify2FA,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
