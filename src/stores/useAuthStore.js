import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  // Estado
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  // Acciones
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(username, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  refreshUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user });
      return user;
    } catch (error) {
      // Si falla, limpiar auth
      authService.clearAuth();
      set({ user: null, isAuthenticated: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),

  // Helpers
  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin' || user?.is_superuser;
  },

  isEmployee: () => {
    const { user } = get();
    return user?.role === 'employee';
  },
}));

