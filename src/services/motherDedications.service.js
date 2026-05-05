import { apiClient } from './api';
import { ENDPOINTS } from './api/endpoints';

export const motherDedicationsService = {
  async getAll() {
    const response = await apiClient.get(ENDPOINTS.MOTHER_DEDICATIONS);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post(ENDPOINTS.MOTHER_DEDICATIONS_CREATE, data);
    return response.data;
  },
};
