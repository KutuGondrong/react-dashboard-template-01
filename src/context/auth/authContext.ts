import { createContext, type Context } from 'react';
import type { LoginCredentials, RegisterCredentials, User } from '@/models/model.type';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

function createAuthContextInstance(): Context<AuthContextValue | null> {
  return createContext<AuthContextValue | null>(null);
}

export const AuthContext: Context<AuthContextValue | null> =
  import.meta.hot?.data?.AuthContext ?? createAuthContextInstance();

if (import.meta.hot) {
  import.meta.hot.data.AuthContext = AuthContext;
}
