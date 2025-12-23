import { apiClient } from './api/client';

const BASE_URL = '/orders';

/**
 * Servicio para gestionar pedidos de clientes
 */
export const ordersService = {
  // ============= PEDIDOS =============

  /**
   * Obtener todos los pedidos
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.status - Filtrar por estado
   * @param {string} params.date - Filtrar por fecha (today, week, month)
   * @param {string} params.active - Solo pedidos activos
   */
  async getOrders(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/`, { params });
    return response.data;
  },

  /**
   * Obtener un pedido por ID
   */
  async getOrder(id) {
    const response = await apiClient.get(`${BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Crear nuevo pedido
   * @param {Object} data - Datos del pedido
   * @param {string} data.customer_name - Nombre del cliente
   * @param {string} data.customer_phone - Teléfono (opcional)
   * @param {string} data.customer_notes - Notas especiales (opcional)
   * @param {string} data.payment_method - Método de pago (opcional)
   * @param {number} data.discount - Descuento (opcional)
   * @param {Array} data.items - Items del pedido
   */
  async createOrder(data) {
    const response = await apiClient.post(`${BASE_URL}/`, data);
    return response.data;
  },

  /**
   * Actualizar pedido
   */
  async updateOrder(id, data) {
    const response = await apiClient.patch(`${BASE_URL}/${id}/`, data);
    return response.data;
  },

  /**
   * Eliminar pedido
   */
  async deleteOrder(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Actualizar estado del pedido
   * @param {number} id - ID del pedido
   * @param {string} status - Nuevo estado (pending, preparing, ready, delivered, cancelled)
   */
  async updateStatus(id, status) {
    const response = await apiClient.post(`${BASE_URL}/${id}/update_status/`, { status });
    return response.data;
  },

  /**
   * Marcar pedido como pagado
   * @param {number} id - ID del pedido
   * @param {string} paymentMethod - Método de pago
   */
  async markAsPaid(id, paymentMethod = '') {
    const response = await apiClient.post(`${BASE_URL}/${id}/mark_paid/`, {
      payment_method: paymentMethod,
    });
    return response.data;
  },

  /**
   * Cancelar pedido
   */
  async cancelOrder(id) {
    const response = await apiClient.post(`${BASE_URL}/${id}/cancel/`);
    return response.data;
  },

  /**
   * Obtener pedidos activos (pendientes, preparando, listos)
   */
  async getActiveOrders() {
    const response = await apiClient.get(`${BASE_URL}/active/`);
    return response.data;
  },

  /**
   * Obtener estadísticas de pedidos
   * @param {string} date - Periodo (today, week, month)
   */
  async getStats(date = 'today') {
    const response = await apiClient.get(`${BASE_URL}/stats/`, { params: { date } });
    return response.data;
  },

  // ============= ORDER ITEMS =============

  /**
   * Agregar item a un pedido existente
   */
  async addItem(orderId, itemData) {
    const response = await apiClient.post('/order-items/', {
      order: orderId,
      ...itemData,
    });
    return response.data;
  },

  /**
   * Actualizar item de pedido
   */
  async updateItem(itemId, data) {
    const response = await apiClient.patch(`/order-items/${itemId}/`, data);
    return response.data;
  },

  /**
   * Eliminar item de pedido
   */
  async deleteItem(itemId) {
    const response = await apiClient.delete(`/order-items/${itemId}/`);
    return response.data;
  },
};

export default ordersService;

