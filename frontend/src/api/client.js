import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rrm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response or normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps response in { success: true, data: ... }
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      const data = error.response.data;
      if (data?.error?.message) {
        message = data.error.message;
      } else if (data?.message) {
        message = data.message;
      } else if (data?.detail) {
        message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }

      if (error.response.status === 401) {
        localStorage.removeItem('rrm_token');
        localStorage.removeItem('rrm_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    } else if (error.request) {
      message = 'Unable to connect to the backend server. Please verify the backend is running.';
    }

    const enhancedError = new Error(message);
    enhancedError.statusCode = error.response?.status;
    enhancedError.original = error;
    return Promise.reject(enhancedError);
  }
);
