import axios from "axios";
import { env } from "@/config";

/**
 * Cliente HTTP para la SESIÓN DE CLIENTE (clientes que inician con Google).
 *
 * Está deliberadamente AISLADO del apiClient de staff: usa sus propias
 * claves de localStorage (`frostbyte_customer_*`) para que la sesión de un
 * cliente nunca se mezcle con la de un administrador/empleado. Pensado para
 * reutilizarse en la Polla y, a futuro, en pedidos.
 */
export const CUSTOMER_TOKEN_KEY = "frostbyte_customer_token";
export const CUSTOMER_REFRESH_KEY = "frostbyte_customer_refresh";
export const CUSTOMER_USER_KEY = "frostbyte_customer_user";

export const customerClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request: agregar el token de cliente
customerClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Renueva el access token usando el refresh token.
 *
 * El backend rota los refresh tokens (ROTATE_REFRESH_TOKENS) y mete el viejo
 * a una lista negra (BLACKLIST_AFTER_ROTATION). Por eso es IMPRESCINDIBLE
 * guardar el refresh token nuevo que devuelve la respuesta: si seguimos usando
 * el viejo, el backend lo rechaza en la siguiente renovación y la sesión muere.
 * Guardar el rotado mantiene la "ventana deslizante": la sesión se renueva con
 * cada uso y dura indefinidamente mientras el cliente siga entrando.
 */
async function refreshCustomerToken() {
  const refreshToken = localStorage.getItem(CUSTOMER_REFRESH_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await axios.post(`${env.API_BASE_URL}/auth/refresh/`, {
    refresh: refreshToken,
  });

  const { access, refresh } = response.data;
  localStorage.setItem(CUSTOMER_TOKEN_KEY, access);
  // Persistir el refresh rotado; si el backend no rotara, mantenemos el actual.
  if (refresh) {
    localStorage.setItem(CUSTOMER_REFRESH_KEY, refresh);
  }
  return access;
}

// Promesa de refresh compartida: si varias peticiones reciben 401 a la vez
// (p. ej. al cargar la Polla), todas esperan la MISMA renovación en lugar de
// disparar refreshes en paralelo que se invalidarían entre sí por la rotación.
let refreshPromise = null;

// Response: refresh automático del token de cliente ante 401
customerClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // No intentar refrescar en los propios endpoints de auth
      if (
        originalRequest.url?.includes("/auth/google") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshCustomerToken().finally(() => {
            refreshPromise = null;
          });
        }
        const access = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return customerClient(originalRequest);
      } catch (refreshError) {
        // Sesión de cliente expirada: limpiar (sin redirecciones forzadas)
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_REFRESH_KEY);
        localStorage.removeItem(CUSTOMER_USER_KEY);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default customerClient;
