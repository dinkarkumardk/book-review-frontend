import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  // Add more user fields as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Keys (unified)
  const TOKEN_KEY = 'auth_token';
  const USER_KEY = 'auth_user';

  const bootstrap = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setInitializing(false);
      return;
    }
    setToken(storedToken);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    } catch (_e) {
      // invalid token
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    // Attempt cached user first for immediate UI, then validate.
    const cachedUser = localStorage.getItem(USER_KEY);
    const cachedToken = localStorage.getItem(TOKEN_KEY);
    if (cachedUser && cachedToken) {
      try { setUser(JSON.parse(cachedUser)); setToken(cachedToken); } catch {}
    }
    bootstrap();
  }, []);

  const login = async (jwtToken: string, userDetails: User): Promise<void> => {
    // Set localStorage first to ensure API interceptor has immediate access
    localStorage.setItem(TOKEN_KEY, jwtToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userDetails));
    
    // Update state synchronously to trigger immediate re-renders
    setToken(jwtToken);
    setUser(userDetails);
    
    // Return a resolved promise to ensure async consistency
    return Promise.resolve();
  };

  const logout = async () => {
    try { await api.post('/auth/logout').catch(() => {}); } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    toast.success('Signed out');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    } catch (e) {
      // If refresh fails, quietly logout to reset state
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
