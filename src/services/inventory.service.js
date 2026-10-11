import { apiClient } from './api/client';

const BASE_URL = '/inventory';

export const inventoryService = {
  // ============= RAW MATERIALS =============
  
  /**
   * Obtener todos los materiales
   */
  async getMaterials(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/raw-materials/`, { params });
    return response.data;
  },

  /**
   * Obtener un material por ID
   */
  async getMaterial(id) {
    const response = await apiClient.get(`${BASE_URL}/raw-materials/${id}/`);
    return response.data;
  },

  /**
   * Crear material
   */
  async createMaterial(data) {
    const response = await apiClient.post(`${BASE_URL}/raw-materials/`, data);
    return response.data;
  },

  /**
   * Actualizar material
   */
  async updateMaterial(id, data) {
    const response = await apiClient.patch(`${BASE_URL}/raw-materials/${id}/`, data);
    return response.data;
  },

  /**
   * Eliminar material
   */
  async deleteMaterial(id) {
    const response = await apiClient.delete(`${BASE_URL}/raw-materials/${id}/`);
    return response.data;
  },

  /**
   * Obtener materiales con stock bajo
   */
  async getLowStock(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/raw-materials/low_stock/`, { params });
    return response.data;
  },

  /**
   * Ajustar stock de un material
   */
  async adjustStock(id, adjustment) {
    const response = await apiClient.post(`${BASE_URL}/raw-materials/${id}/adjust_stock/`, {
      adjustment,
    });
    return response.data;
  },

  /**
   * Actualizar precio de un material
   */
  async updatePrice(id, costPerUnit) {
    const response = await apiClient.patch(`${BASE_URL}/raw-materials/${id}/update_price/`, {
      cost_per_unit: costPerUnit,
    });
    return response.data;
  },

  /**
   * Obtener estadísticas del inventario
   */
  async getStats(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/raw-materials/stats/`, { params });
    return response.data;
  },

  // ============= PURCHASE ORDERS =============

  /**
   * Obtener órdenes de compra
   */
  async getPurchaseOrders(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/purchase-orders/`, { params });
    return response.data;
  },

  /**
   * Obtener una orden de compra
   */
  async getPurchaseOrder(id) {
    const response = await apiClient.get(`${BASE_URL}/purchase-orders/${id}/`);
    return response.data;
  },

  /**
   * Crear orden de compra
   */
  async createPurchaseOrder(data) {
    const response = await apiClient.post(`${BASE_URL}/purchase-orders/`, data);
    return response.data;
  },

  /**
   * Generar orden desde stock bajo
   */
  async generateFromLowStock(business) {
    const response = await apiClient.post(
      `${BASE_URL}/purchase-orders/generate_from_low_stock/`,
      business ? { business } : {}
    );
    return response.data;
  },

  /**
   * Marcar orden como comprada
   */
  async markOrderPurchased(id) {
    const response = await apiClient.post(`${BASE_URL}/purchase-orders/${id}/mark_purchased/`);
    return response.data;
  },

  /**
   * Cancelar orden
   */
  async cancelOrder(id) {
    const response = await apiClient.post(`${BASE_URL}/purchase-orders/${id}/cancel/`);
    return response.data;
  },

  /**
   * Revertir orden a pendiente
   */
  async revertOrderToPending(id) {
    const response = await apiClient.post(`${BASE_URL}/purchase-orders/${id}/revert_to_pending/`);
    return response.data;
  },

  /**
   * Eliminar orden
   */
  async deleteOrder(id) {
    const response = await apiClient.delete(`${BASE_URL}/purchase-orders/${id}/`);
    return response.data;
  },

  /**
   * Marcar item como comprado
   */
  async purchaseItem(orderId, itemId, data) {
    const response = await apiClient.post(
      `${BASE_URL}/purchase-orders/${orderId}/items/${itemId}/purchase/`,
      data
    );
    return response.data;
  },

  /**
   * Agregar item a orden
   */
  async addItemToOrder(orderId, data) {
    const response = await apiClient.post(
      `${BASE_URL}/purchase-orders/${orderId}/add_item/`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar item de orden
   */
  async removeItemFromOrder(orderId, itemId) {
    const response = await apiClient.delete(
      `${BASE_URL}/purchase-orders/${orderId}/items/${itemId}/`
    );
    return response.data;
  },

  /**
   * Actualizar item de orden
   */
  async updateOrderItem(orderId, itemId, data) {
    const response = await apiClient.patch(
      `${BASE_URL}/purchase-orders/${orderId}/items/${itemId}/update/`,
      data
    );
    return response.data;
  },

  // ============= UNITS =============

  /**
   * Obtener unidades de medida
   */
  async getUnits() {
    const response = await apiClient.get(`${BASE_URL}/units/`);
    return response.data;
  },

  // ============= RECIPES (costeo por variante) =============

  /**
   * Receta y costeo de una variante: ingredientes, costo total, ganancia,
   * margen, food cost y precio sugerido.
   */
  async getVariantCosting(variantId) {
    const response = await apiClient.get(`${BASE_URL}/recipes/by-variant/${variantId}/`);
    return response.data;
  },

  /**
   * Reemplaza la receta entera de una variante en una sola llamada.
   * items: [{ raw_material_id, quantity, notes }]
   */
  async saveVariantRecipe(variantId, items) {
    const response = await apiClient.put(`${BASE_URL}/recipes/by-variant/${variantId}/`, {
      items,
    });
    return response.data;
  },

  /**
   * Costeo de todo el catálogo (una fila por variante) con resumen de cobertura.
   * params: { business, category, include_inactive }
   */
  async getCostingSummary(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/recipes/costing-summary/`, { params });
    return response.data;
  },
};

