'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

/**
 * AuthContextValue — contrato público de autenticação
 */
export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { sub: string } | null;
  login: (user: { sub: string; email?: string }) => void;
  logout: () => void;
}

/**
 * AuthContext — gerencia estado de autenticação via /api/auth/me
 *
 * - Carrega ao montar: chama GET /api/auth/me
 * - Enquanto carrega: isLoading = true
 * - Detecta sessão: isAuthenticated = true se cookie auth_token é válido
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ sub: string } | null>(null);

  const login = useCallback((userData: { sub: string; email?: string }) => {
    setIsAuthenticated(true);
    setUser({ sub: userData.sub });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    /**
     * Verificar autenticação ao montar
     * GET /api/auth/me retorna:
     *   { authenticated: true, sub: string } ou
     *   { authenticated: false }
     */
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser({ sub: data.sub });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — hook para consumir contexto de autenticação
 *
 * @throws Error se usado fora de AuthProvider
 * @returns { isAuthenticated, isLoading, user }
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
