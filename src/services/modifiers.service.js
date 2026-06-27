import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para grupos/opciones de modificadores (productos configurables).
 *
 * Nota: estos endpoints NO estan paginados en el backend, devuelven arrays
 * directos (no { results }).
 */
export const modifiersService = {
  // --- Grupos ---
  async getGroups(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MODIFIER_GROUPS, { params });
    return response.data;
  },

  async getGroup(id) {
    const response = await apiClient.get(ENDPOINTS.MODIFIER_GROUP_DETAIL(id));
    return response.data;
  },

  async createGroup(data) {
    const response = await apiClient.post(ENDPOINTS.MODIFIER_GROUPS, data);
    return response.data;
  },

  async updateGroup(id, data) {
    const response = await apiClient.patch(ENDPOINTS.MODIFIER_GROUP_DETAIL(id), data);
    return response.data;
  },

  async deleteGroup(id) {
    const response = await apiClient.delete(ENDPOINTS.MODIFIER_GROUP_DETAIL(id));
    return response.data;
  },

  // --- Opciones ---
  async getOptions(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MODIFIER_OPTIONS, { params });
    return response.data;
  },

  async createOption(data) {
    const response = await apiClient.post(ENDPOINTS.MODIFIER_OPTIONS, data);
    return response.data;
  },

  async updateOption(id, data) {
    const response = await apiClient.patch(ENDPOINTS.MODIFIER_OPTION_DETAIL(id), data);
    return response.data;
  },

  async deleteOption(id) {
    const response = await apiClient.delete(ENDPOINTS.MODIFIER_OPTION_DETAIL(id));
    return response.data;
  },

  // --- Asociacion grupo <-> producto ---
  async getProductModifiers(productSlug) {
    const response = await apiClient.get(ENDPOINTS.PRODUCT_MODIFIERS, {
      params: { product: productSlug },
    });
    return response.data;
  },

  async linkGroupToProduct(data) {
    const response = await apiClient.post(ENDPOINTS.PRODUCT_MODIFIERS, data);
    return response.data;
  },

  async updateProductModifier(id, data) {
    const response = await apiClient.patch(ENDPOINTS.PRODUCT_MODIFIER_DETAIL(id), data);
    return response.data;
  },

  async unlinkGroupFromProduct(id) {
    const response = await apiClient.delete(ENDPOINTS.PRODUCT_MODIFIER_DETAIL(id));
    return response.data;
  },
};

export default modifiersService;
