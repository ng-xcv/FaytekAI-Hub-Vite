import axios from 'axios';
import { HOST_API } from '../config';

const axiosInstance = axios.create({
  baseURL: HOST_API,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest)).catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axiosInstance.post('/api/auth/refresh-token');
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject((error.response && error.response.data) || 'Erreur réseau');
  }
);

export default axiosInstance;
