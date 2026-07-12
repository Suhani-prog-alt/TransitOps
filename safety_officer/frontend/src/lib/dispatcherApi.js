import axios from 'axios';

const dispatcherApi = axios.create({
  baseURL: 'http://localhost:5003/api',
});

dispatcherApi.interceptors.request.use(
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

export default dispatcherApi;
