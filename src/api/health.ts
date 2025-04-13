/**
 * Health check API client
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Check if the backend API is reachable
 *
 * @returns A promise that resolves to the health check response
 */
export async function checkHealth(): Promise<{ [key: string]: any }> {
  const response = await fetch(`${BACKEND_URL}/`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}
