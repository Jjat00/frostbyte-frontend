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
   * Obtener pedidos con pagos pendientes (sin importar la fecha)
   * @returns {Promise<{orders: Array, total_orders: number, total_pending: string}>}
   */
  async getPendingPayments() {
    const response = await apiClient.get(`${BASE_URL}/pending_payments/`);
    return response.data;
  },

  /**
   * Obtener estadísticas de pedidos
   * @param {string} date - Periodo (today, yesterday, week, month, last_month, year)
   * @param {string} start_date - Fecha inicio (YYYY-MM-DD) para rango personalizado
   * @param {string} end_date - Fecha fin (YYYY-MM-DD) para rango personalizado
   */
  async getStats(date = 'today', start_date = null, end_date = null) {
    const params = { date };
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    const response = await apiClient.get(`${BASE_URL}/stats/`, { params });
    return response.data;
  },

  /**
   * Obtener ingresos por día para gráfica de línea
   * @param {string} date - Periodo (today, yesterday, week, month, last_month, year)
   * @param {string} start_date - Fecha inicio (YYYY-MM-DD) para rango personalizado
   * @param {string} end_date - Fecha fin (YYYY-MM-DD) para rango personalizado
   */
  async getRevenueByDay(date = 'today', start_date = null, end_date = null) {
    const params = { date };
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    const response = await apiClient.get(`${BASE_URL}/revenue_by_day/`, { params });
    return response.data;
  },

  /**
   * Obtener estadísticas por producto (cantidad vendida e ingresos)
   * @param {string} date - Periodo (today, yesterday, week, month, last_month, year)
   * @param {string} start_date - Fecha inicio (YYYY-MM-DD) para rango personalizado
   * @param {string} end_date - Fecha fin (YYYY-MM-DD) para rango personalizado
   */
  async getProductStats(date = 'today', start_date = null, end_date = null) {
    const params = { date };
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    const response = await apiClient.get(`${BASE_URL}/product_stats/`, { params });
    return response.data;
  },

  // ============= ORDER ITEMS =============

  /**
   * Agregar item a un pedido existente
   * @param {number} orderId - ID del pedido
   * @param {Object} itemData - Datos del item
   * @param {number} itemData.product_variant_id - ID de la variante del producto
   * @param {number} itemData.quantity - Cantidad
   * @param {string} itemData.notes - Notas (opcional)
   */
  async addItemToOrder(orderId, itemData) {
    const response = await apiClient.post(`${BASE_URL}/${orderId}/add_item/`, itemData);
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

  /**
   * Marcar un item como pagado
   * @param {number} itemId - ID del item
   * @param {string} paymentMethod - Método de pago (cash, nequi, card, transfer, daviplata)
   */
  async markItemAsPaid(itemId, paymentMethod = '') {
    const response = await apiClient.post(`/order-items/${itemId}/mark_paid/`, {
      payment_method: paymentMethod,
    });
    return response.data;
  },

  /**
   * Desmarcar un item como pagado
   * @param {number} itemId - ID del item
   */
  async unmarkItemAsPaid(itemId) {
    const response = await apiClient.post(`/order-items/${itemId}/unmark_paid/`);
    return response.data;
  },

  /**
   * Cambiar el método de pago de un item
   * @param {number} itemId - ID del item
   * @param {string} paymentMethod - Nuevo método de pago
   */
  async changeItemPaymentMethod(itemId, paymentMethod) {
    const response = await apiClient.post(`/order-items/${itemId}/change_payment_method/`, {
      payment_method: paymentMethod,
    });
    return response.data;
  },

  /**
   * Marcar un item como entregado
   * @param {number} itemId - ID del item
   */
  async markItemAsDelivered(itemId) {
    const response = await apiClient.post(`/order-items/${itemId}/mark_delivered/`);
    return response.data;
  },

  /**
   * Desmarcar un item como entregado
   * @param {number} itemId - ID del item
   */
  async unmarkItemAsDelivered(itemId) {
    const response = await apiClient.post(`/order-items/${itemId}/unmark_delivered/`);
    return response.data;
  },
};

export default ordersService;

