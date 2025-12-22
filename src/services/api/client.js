import axios from 'axios';
import { env } from '@/config';

/**
 * Cliente HTTP configurado con axios
 * Maneja interceptores, errores y configuración base
 */
const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar tokens de autenticación si es necesario
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('API Error:', error.response.status, error.response.data);
      
      switch (error.response.status) {
        case 401:
          // Manejar no autorizado
          break;
        case 404:
          // Manejar no encontrado
          break;
        case 500:
          // Manejar error del servidor
          break;
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('Network Error:', error.message);
    } else {
      // Error en la configuración de la petición
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

