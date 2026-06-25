import { create } from "zustand";

/**
 * Compuerta de login del carrito.
 *
 * El pedido exige iniciar sesión con Google ANTES de agregar productos. Los
 * botones "Agregar" llaman a `requireAuth(action)`: se abre el modal de login y
 * se guarda la acción pendiente (agregar ese producto). Tras autenticarse,
 * `resolve()` la ejecuta, así el cliente no pierde el producto que quería pedir.
 *
 * Vive en memoria (sin persist): las acciones pendientes son funciones.
 */
export const useCartAuthGate = create((set, get) => ({
  open: false,
  pendingAction: null,

  /** Abre el modal y recuerda qué hacer cuando haya sesión. */
  requireAuth: (action) =>
    set({ open: true, pendingAction: typeof action === "function" ? action : null }),

  /** Login exitoso: ejecuta la acción pendiente y cierra. */
  resolve: () => {
    const { pendingAction } = get();
    set({ open: false, pendingAction: null });
    if (typeof pendingAction === "function") pendingAction();
  },

  /** Cierra sin ejecutar nada (el cliente canceló el login). */
  close: () => set({ open: false, pendingAction: null }),
}));

export default useCartAuthGate;
