import { customerClient } from "./api/customerClient";

/**
 * Servicio de PEDIDOS DEL CLIENTE (pedidos en línea autenticados con Google).
 *
 * Usa `customerClient` (Bearer del cliente), NO el apiClient del staff. Espejo
 * del patrón de `customerAuth.service.js`. Pega contra /my-orders/.
 */
export const customerOrdersService = {
  /** Crea un pedido propio. Entra directo a la cola como PENDING. */
  async create(data) {
    const response = await customerClient.post("/my-orders/", data);
    return response.data;
  },

  /** Lista 'Mis pedidos' del cliente autenticado. */
  async list() {
    const response = await customerClient.get("/my-orders/");
    return response.data;
  },

  /** Detalle/seguimiento de un pedido propio. */
  async get(id) {
    const response = await customerClient.get(`/my-orders/${id}/`);
    return response.data;
  },

  /** Configuración pública del local (tarifa de envío, tipos activos). */
  async getConfig() {
    const response = await customerClient.get("/my-orders/config/");
    return response.data;
  },
};

export default customerOrdersService;
