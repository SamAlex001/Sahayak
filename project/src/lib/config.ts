export const API_URL = import.meta.env.VITE_API_URL || '';
// Socket.IO needs the full backend URL
// In production, this must be set to the Render backend URL
// In development, empty string will use Vite proxy
export const SOCKET_URL = import.meta.env.VITE_API_URL || '';

// Helper to get Socket.IO connection URL
export const getSocketUrl = (): string => {
  // In production, warn if URL is not set
  if (import.meta.env.PROD && !SOCKET_URL) {
    console.error('⚠️ VITE_API_URL is not set! Socket.IO will not work. Please set it in Vercel environment variables.');
  }
  // In development, use empty string to connect via Vite proxy
  // In production, use the full backend URL (or empty if not set, which will fail gracefully)
  return SOCKET_URL;
};