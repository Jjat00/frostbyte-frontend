import { create } from "zustand";
import { customerAuthService } from "../services/customerAuth.service";
import { pollaService } from "../services/polla.service";
import { consumeStoredReferral } from "../utils/referral";

/**
 * Estado global de la SESIÓN DE CLIENTE (login con Google).
 *
 * Separado de useAuthStore (staff). General y reutilizable: hoy la Polla,
 * mañana pedidos.
 */
export const useCustomerAuthStore = create((set, get) => ({
  customer: customerAuthService.getStoredCustomer(),
  isAuthenticated: customerAuthService.isAuthenticated(),
  isLoading: false,
  error: null,

  /**
   * Inicia sesión con el credential de Google.
   */
  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await customerAuthService.loginWithGoogle(credential);
      set({ customer: user, isAuthenticated: true, isLoading: false });

      // Si el usuario llegó por un enlace de invitación, registrar el vínculo.
      // No debe romper el login si falla; el token ya quedó guardado.
      const ref = consumeStoredReferral();
      if (ref) {
        try {
          await pollaService.claimReferral(ref);
        } catch {
          // Código inválido / ya jugó / ya vinculado: silencioso.
        }
      }

      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "No pudimos iniciar tu sesión con Google. Intenta de nuevo.";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await customerAuthService.logout();
    set({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Actualiza el perfil propio (nombre, teléfono, opt-out de correos).
   */
  updateProfile: async (data) => {
    try {
      const user = await customerAuthService.updateProfile(data);
      set({ customer: user });
      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "No pudimos guardar tu perfil. Intenta de nuevo.";
      return { success: false, error: message };
    }
  },

  refreshCustomer: async () => {
    try {
      const user = await customerAuthService.getCurrentCustomer();
      set({ customer: user });
      return user;
    } catch (error) {
      customerAuthService.clearAuth();
      set({ customer: null, isAuthenticated: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCustomerAuthStore;
