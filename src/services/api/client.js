import axios from 'axios';
import { env } from '@/config';

const TOKEN_KEY = 'frostbyte_access_token';
const REFRESH_KEY = 'frostbyte_refresh_token';

/**
 * Cliente HTTP configurado con axios
 * Maneja interceptores, errores y configuración base
 */
export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - manejo de errores y refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si es la ruta de login o refresh, no intentar refresh
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Intentar refrescar el token
        const response = await axios.post(`${env.API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem(TOKEN_KEY, access);

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar auth y redirigir al login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem('frostbyte_user');
        
        // Redirigir al login si estamos en una ruta protegida
        if (window.location.pathname.startsWith('/inventario')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Manejo de otros errores
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
