'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthTokens, AuthUserDto, LoginDto } from '@ai-academy/types';
import { api, tokenStore } from './api';

interface AuthState {
  user: AuthUserDto | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshMe = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<AuthUserDto>('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (dto: LoginDto) => {
      const tokens = await api.post<AuthTokens & { user: AuthUserDto }>(
        '/auth/login',
        dto,
        false,
      );
      tokenStore.set(tokens);
      setUser(tokens.user);
      router.push(tokens.user.role === 'PARENT' ? '/parent' : '/home');
    },
    [router],
  );

  const logout = useCallback(() => {
    void api.post('/auth/logout').catch(() => undefined);
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong <AuthProvider>');
  return ctx;
}
