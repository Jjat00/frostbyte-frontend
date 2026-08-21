import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Configuración operativa del local para el STAFF (abierto/cerrado, domicilios).
 *
 * Usa `apiClient` (Bearer del staff). El endpoint exige rol admin o empleado
 * (IsStaffMember en el backend). Para la lectura pública que ve el cliente se
 * usa `customerOrdersService.getConfig()` (endpoint /my-orders/config/).
 */
export const storeSettingsService = {
  /** Estado actual: { is_open, customer_ordering_enabled, can_order, delivery_fee, delivery_radius_km, delivery_area, status_changed_at } */
  async get() {
    const response = await apiClient.get(ENDPOINTS.STORE_SETTINGS);
    return response.data;
  },

  /**
   * Actualiza los interruptores y/o la zona de cobertura.
   * La zona (radio o polígono) solo la acepta el backend si el usuario es
   * admin. `delivery_area` es una lista de figuras, cada una lista de puntos
   * [lng, lat]; enviarla vacía borra el polígono y devuelve el mando al radio.
   * @param {{ is_open?: boolean, customer_ordering_enabled?: boolean, delivery_radius_km?: number, delivery_area?: number[][][] }} data
   */
  async update(data) {
    const response = await apiClient.patch(ENDPOINTS.STORE_SETTINGS, data);
    return response.data;
  },
};

export default storeSettingsService;
