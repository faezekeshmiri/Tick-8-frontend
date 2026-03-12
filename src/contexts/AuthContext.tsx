import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { setAccessToken } from '../api/client';
import { AuthUser, LoginPayload, RegisterPayload } from '../types/auth.types';
import { SUPPORTED_LOCALES, SupportedLocale } from '../assets/theme';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const queryClient = useQueryClient();

  // Attempt silent refresh on first mount to restore session from cookie
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    authApi
      .refreshToken()
      .then((u) => setUser(u))
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for forced logout (e.g. refresh failed in axios interceptor)
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setAccessToken(null);
      queryClient.clear();
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [queryClient]);

  const applyGuestLang = useCallback(async (u: AuthUser) => {
    try {
      const stored = localStorage.getItem('tick8-guest-lang');
      if (
        stored &&
        SUPPORTED_LOCALES.includes(stored as SupportedLocale) &&
        stored !== u.preferred_language
      ) {
        const updated = await authApi.updateProfile({ preferred_language: stored });
        setUser(updated);
      }
    } catch { /* best-effort */ }
    localStorage.removeItem('tick8-guest-lang');
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: u } = await authApi.login(payload);
    setUser(u);
    applyGuestLang(u);
  }, [applyGuestLang]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: u } = await authApi.register(payload);
    setUser(u);
    applyGuestLang(u);
  }, [applyGuestLang]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const updateUser = useCallback((u: AuthUser) => {
    setUser(u);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authApi.getMe();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
