import { apiClient } from './api';
import { ENDPOINTS } from './api/endpoints';

export const dedicationsService = {
  async getAll() {
    const response = await apiClient.get(ENDPOINTS.DEDICATIONS);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post(ENDPOINTS.DEDICATIONS_CREATE, data);
    return response.data;
  },
};
