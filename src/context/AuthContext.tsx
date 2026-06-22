import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { localSource } from '@/datasource/local/localSource';
import { setUnauthorizedHandler } from '@/datasource/network/services/backendService';
import type { AuthSession, LoginCredentials, RegisterCredentials, User } from '@/models/model.type';
import { authUsecase } from '@/features/auth/usecase/authUsecase';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => localSource.getUser());
  const [token, setToken] = useState<string | null>(() => localSource.getToken());
  const [isLoading, setIsLoading] = useState(false);

  const clearSession = useCallback(() => {
    localSource.clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const persistSession = useCallback((session: AuthSession) => {
    localSource.setToken(session.token);
    localSource.setUser(session.user);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const session = await authUsecase.login(credentials);
        persistSession(session);
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsLoading(true);
      try {
        const session = await authUsecase.register(credentials);
        persistSession(session);
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authUsecase.logout();
    } finally {
      clearSession();
      setIsLoading(false);
      navigate('/login');
    }
  }, [clearSession, navigate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      navigate('/login', { replace: true });
    };

    setUnauthorizedHandler(handleUnauthorized);

    const listener = () => handleUnauthorized();
    window.addEventListener('auth:unauthorized', listener);

    return () => {
      window.removeEventListener('auth:unauthorized', listener);
    };
  }, [clearSession, navigate]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      clearSession,
    }),
    [user, token, isLoading, login, register, logout, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
