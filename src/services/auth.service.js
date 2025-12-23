import { apiClient } from "./api/client";

const TOKEN_KEY = "frostbyte_access_token";
const REFRESH_KEY = "frostbyte_refresh_token";
const USER_KEY = "frostbyte_user";

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(username, password) {
    const response = await apiClient.post("/auth/login/", {
      username,
      password,
    });
    const { user, tokens } = response.data;

    // Guardar tokens y usuario
    localStorage.setItem(TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, tokens };
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        await apiClient.post("/auth/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      this.clearAuth();
    }
  },

  /**
   * Limpiar datos de autenticación
   */
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Obtener token de acceso
   */
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Obtener refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },

  /**
   * Obtener usuario almacenado
   */
  getStoredUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  /**
   * Refrescar token
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const response = await apiClient.post("/auth/refresh/", {
      refresh: refreshToken,
    });
    const { access } = response.data;

    localStorage.setItem(TOKEN_KEY, access);
    return access;
  },

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser() {
    const response = await apiClient.get("/auth/me/");
    const user = response.data;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(oldPassword, newPassword) {
    const response = await apiClient.post("/auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};
