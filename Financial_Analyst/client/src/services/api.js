import axios from 'axios';

const API = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT to auth headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => API.post('/api/auth/login', credentials),
  register: (userData) => API.post('/api/auth/register', userData),
  getProfile: () => API.get('/api/auth/profile'),
};

// Fuel Logs endpoints
export const fuelAPI = {
  getLogs: (params) => API.get('/api/fuel', { params }),
  getLogById: (id) => API.get(`/api/fuel/${id}`),
  createLog: (data) => API.post('/api/fuel', data),
  updateLog: (id, data) => API.put(`/api/fuel/${id}`, data),
  deleteLog: (id) => API.delete(`/api/fuel/${id}`),
};

// Expense Logs endpoints
export const expenseAPI = {
  getExpenses: (params) => API.get('/api/expenses', { params }),
  getExpenseById: (id) => API.get(`/api/expenses/${id}`),
  createExpense: (data) => API.post('/api/expenses', data),
  updateExpense: (id, data) => API.put(`/api/expenses/${id}`, data),
  deleteExpense: (id) => API.delete(`/api/expenses/${id}`),
};

// Report endpoints
export const reportAPI = {
  getReports: () => API.get('/api/reports'),
  createReport: (data) => API.post('/api/reports', data),
  downloadReport: (id) => API.get(`/api/reports/${id}/download`, { responseType: 'blob' }),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboardMetrics: (params) => API.get('/api/analytics/dashboard', { params }),
  getChartData: (params) => API.get('/api/analytics/charts', { params }),
};

export default API;
