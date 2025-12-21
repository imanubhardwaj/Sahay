/**
 * Token storage utilities for client-side token management
 */

const TOKEN_KEY = 'auth_token';

/**
 * Store token in localStorage
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove token from localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Get authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
}

/**
 * Create fetch options with authorization header
 */
export function getAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getToken();
  return {
    ...headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
