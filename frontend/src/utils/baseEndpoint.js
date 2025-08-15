// Base API endpoint - configured for Vite environments
export const BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || "https://blog-app-0iek.onrender.com/api/v1")
  : "http://localhost:5000/api/v1";

// Fallback URL for development
export const FALLBACK_URL = "http://localhost:5000/api/v1";

// Helper function to get the current base URL
export const getBaseUrl = () => {
  return BASE_URL;
};
