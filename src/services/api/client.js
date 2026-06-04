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

/**
 * Renueva el access token usando el refresh token.
 *
 * El backend rota los refresh tokens (ROTATE_REFRESH_TOKENS) e invalida el
 * viejo (BLACKLIST_AFTER_ROTATION). Por eso hay que guardar el refresh nuevo
 * que devuelve la respuesta: si seguimos mandando el viejo, el backend lo
 * rechaza en la siguiente renovación y la sesión muere antes de tiempo.
 */
async function refreshStaffToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(`${env.API_BASE_URL}/auth/refresh/`, {
    refresh: refreshToken,
  });

  const { access, refresh } = response.data;
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
  return access;
}

// Promesa de refresh compartida: peticiones que reciben 401 a la vez esperan
// la MISMA renovación en lugar de disparar refreshes paralelos que se
// invalidarían entre sí por la rotación de tokens.
let refreshPromise = null;

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
        if (!refreshPromise) {
          refreshPromise = refreshStaffToken().finally(() => {
            refreshPromise = null;
          });
        }
        const access = await refreshPromise;

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
