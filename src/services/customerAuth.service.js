import {
  customerClient,
  CUSTOMER_TOKEN_KEY,
  CUSTOMER_REFRESH_KEY,
  CUSTOMER_USER_KEY,
} from "./api/customerClient";

/**
 * Servicio de autenticación de CLIENTES (login con Google).
 *
 * General y reutilizable: hoy lo usa la Polla Mundialista, mañana puede
 * usarlo el flujo de pedidos. Mantiene la sesión separada del staff.
 */
export const customerAuthService = {
  /**
   * Inicia sesión con el credential (id_token) de Google Identity Services.
   * El backend lo verifica, crea/obtiene el cliente y devuelve {user, tokens}.
   */
  async loginWithGoogle(credential) {
    const response = await customerClient.post("/auth/google/", { credential });
    const { user, tokens } = response.data;

    localStorage.setItem(CUSTOMER_TOKEN_KEY, tokens.access);
    localStorage.setItem(CUSTOMER_REFRESH_KEY, tokens.refresh);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));

    return { user, tokens };
  },

  /**
   * Cierra la sesión del cliente (invalida el refresh token en el backend).
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem(CUSTOMER_REFRESH_KEY);
      if (refreshToken) {
        await customerClient.post("/auth/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Error al cerrar sesión de cliente:", error);
    } finally {
      this.clearAuth();
    }
  },

  clearAuth() {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_REFRESH_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
  },

  getAccessToken() {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  },

  getStoredCustomer() {
    const user = localStorage.getItem(CUSTOMER_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getAccessToken();
  },

  /**
   * Obtiene los datos actualizados del cliente autenticado.
   */
  async getCurrentCustomer() {
    const response = await customerClient.get("/auth/me/");
    const user = response.data;
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
    return user;
  },
};

export default customerAuthService;
