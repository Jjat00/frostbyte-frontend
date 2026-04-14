import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar solicitudes de videos de YouTube
 */
export const youtubeService = {
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS, { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUEST_DETAIL(id));
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post(ENDPOINTS.VIDEO_REQUESTS, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await apiClient.post(
      `${ENDPOINTS.VIDEO_REQUEST_DETAIL(id)}update_status/`,
      { status }
    );
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.VIDEO_REQUEST_DETAIL(id));
    return response.data;
  },

  async search(query) {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS_SEARCH, {
      params: { q: query },
    });
    return response.data;
  },

  async getRecommendations() {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS_RECOMMENDATIONS);
    return response.data;
  },

  async getQuotaStatus() {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS_QUOTA_STATUS);
    return response.data;
  },

  async resetQuotaCounter() {
    const response = await apiClient.post(ENDPOINTS.VIDEO_REQUESTS_QUOTA_RESET);
    return response.data;
  },

  async getNowPlaying() {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS_NOW_PLAYING);
    return response.data;
  },

  async getLastPlayed() {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS_LAST_PLAYED);
    return response.data;
  },

  async getQueue() {
    const response = await apiClient.get(ENDPOINTS.VIDEO_REQUESTS_QUEUE);
    return response.data;
  },

  async playerPlay(id) {
    const response = await apiClient.post(ENDPOINTS.VIDEO_PLAYER_PLAY, { id });
    return response.data;
  },

  async playerNext() {
    const response = await apiClient.post(ENDPOINTS.VIDEO_PLAYER_NEXT);
    return response.data;
  },

  async playerPause() {
    const response = await apiClient.post(ENDPOINTS.VIDEO_PLAYER_PAUSE);
    return response.data;
  },

  async playerResume() {
    const response = await apiClient.post(ENDPOINTS.VIDEO_PLAYER_RESUME);
    return response.data;
  },
};

export default youtubeService;
