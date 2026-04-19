/**
 * AUTH_PAGES — Rotas que não requerem autenticação
 * Centralizado para evitar inconsistência entre componentes
 */
export const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/resend-confirmation',
  '/change-password',
];

/**
 * Verifica se um pathname é uma página de autenticação
 */
export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname.startsWith(page));
}
