// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in development or production
  const environment = process.env.REACT_APP_ENVIRONMENT || 'development';
  
  // If explicitly set via environment variable, use that
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // If Railway URL is set, use that for production
  if (process.env.REACT_APP_RAILWAY_API_URL && environment === 'production') {
    return process.env.REACT_APP_RAILWAY_API_URL;
  }
  
  // Check if we're running on localhost and backend might be on Railway
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use local backend first, fallback to Railway
    return 'http://localhost:8000';
  }
  
  // Default to Railway deployment - UPDATE THIS URL when you get the new Railway URL
  return 'https://your-backend-app.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

// Export configuration object
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to check if API is available
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  environment: process.env.REACT_APP_ENVIRONMENT || 'development'
});
