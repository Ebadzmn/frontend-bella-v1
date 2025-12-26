/**
 * API Configuration
 * Centralizes API base URL configuration for all fetch requests
 */

// Get API URL from environment variable or use default
// Append /api path to the base URL
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

// Ensure no trailing slash
export const API_URL = API_BASE_URL.replace(/\/$/, '');

/**
 * Helper function to construct full API endpoint URL
 * @param path - API endpoint path (e.g., '/auth/login')
 * @returns Full URL with API base
 */
export const getApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

/**
 * Helper function for authenticated fetch requests
 * Automatically adds Authorization header with JWT token
 */
export const authenticatedFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
};
