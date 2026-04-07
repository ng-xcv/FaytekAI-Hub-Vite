import axios from 'axios';
import { HOST_API } from '../config';

const axiosInstance = axios.create({
  baseURL: HOST_API,
  withCredentials: true,
});

// ─── Injecter le token à chaque requête ──────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Refresh token automatique sur 401 ───────────────────────────────────────
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
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${HOST_API}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject((error.response && error.response.data) || 'Erreur réseau');
  }
);

export default axiosInstance;
