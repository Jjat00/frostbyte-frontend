import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar negocios (Frostbyte, Frostbyte Food)
 */
export const businessService = {
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.BUSINESSES, { params });
    return response.data;
  },

  async getBySlug(slug) {
    const response = await apiClient.get(ENDPOINTS.BUSINESS_DETAIL(slug));
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post(ENDPOINTS.BUSINESSES, data);
    return response.data;
  },

  async update(slug, data) {
    const response = await apiClient.patch(ENDPOINTS.BUSINESS_DETAIL(slug), data);
    return response.data;
  },

  async delete(slug) {
    const response = await apiClient.delete(ENDPOINTS.BUSINESS_DETAIL(slug));
    return response.data;
  },
};

export default businessService;
