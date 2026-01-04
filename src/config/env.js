/**
 * Configuración de variables de entorno
 * Accede a las variables de .env de forma tipada y centralizada
 */

export const env = {
  // API
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",

  // WebSocket (si no está definido, se construye desde API_BASE_URL o window.location)
  WS_URL: import.meta.env.VITE_WS_URL || null,

  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || "Frostbyte",
  APP_ENV: import.meta.env.VITE_APP_ENV || "development",

  // Feature flags
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === "true",

  // Helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default env;
