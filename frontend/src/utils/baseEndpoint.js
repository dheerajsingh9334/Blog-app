// Base API endpoint - can be configured for different environments
export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || "https://your-production-domain.com/api/v1"
  : "http://localhost:5000/api/v1";

// Fallback URL for development
export const FALLBACK_URL = "http://localhost:5000/api/v1";

// Helper function to get the current base URL
export const getBaseUrl = () => {
  return BASE_URL;
};
