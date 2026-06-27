import { create } from 'zustand';

const STORAGE_KEY = 'frostbyte_selected_business';

/**
 * Store del negocio activo en el panel admin (Frostbyte / Frostbyte Food).
 *
 * `selectedBusinessSlug` vacio ('') significa "Todos los negocios" (consolidado):
 * los listados no filtran y el dashboard muestra el consolidado.
 */
export const useBusinessStore = create((set) => ({
  selectedBusinessSlug: localStorage.getItem(STORAGE_KEY) || '',

  setSelectedBusiness: (slug) => {
    const value = slug || '';
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ selectedBusinessSlug: value });
  },
}));

export default useBusinessStore;
