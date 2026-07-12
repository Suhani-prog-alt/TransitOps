import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to add authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to central portal if unauthorized
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      window.location.href = 'http://localhost:8080';
    }
    return Promise.reject(error);
  }
);

export default API;
