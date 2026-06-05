'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_nombre: string;
  exp: number;
  [key: string]: unknown;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  email: string;
  role: string;
  tenantId: string;
  tenantNombre: string;
}

interface RegisterOptions {
  tenantId?: string;
  nombreInstitucion?: string;
}

interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    email: string,
    password: string,
    nombre: string,
    rol: string,
    options?: RegisterOptions
  ) => Promise<string | null>;
  logout: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}

// ─── Context ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Al montar: leer token de localStorage y verificar expiración ──
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      const payload = decodeJwt(stored);
      if (payload && !isTokenExpired(payload)) {
        setToken(stored);
        setUser(payload);
      } else {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { data, error } = await api.post<LoginResponse>(
        '/api/Auth/login',
        { email, password }
      );

      if (error || !data) {
        return error || 'Error desconocido al iniciar sesión';
      }

      const payload = decodeJwt(data.token);
      if (!payload) {
        return 'Token inválido recibido del servidor';
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(payload);
      return null;
    },
    []
  );

  // ── Register ──────────────────────────────────────────────────────
  const register = useCallback(
    async (
      email: string,
      password: string,
      nombre: string,
      rol: string,
      options?: RegisterOptions
    ): Promise<string | null> => {
      const { data, error } = await api.post<LoginResponse>(
        '/api/Auth/register',
        {
          email,
          password,
          nombre,
          rol,
          tenantId: options?.tenantId ?? null,
          nombreInstitucion: options?.nombreInstitucion ?? null,
        }
      );
      if (error || !data) {
        return error || 'Error desconocido al registrarse';
      }
      const payload = decodeJwt(data.token);
      if (!payload) {
        return 'Token inválido recibido del servidor';
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(payload);
      return null;
    },
    []
  );

  // ── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
