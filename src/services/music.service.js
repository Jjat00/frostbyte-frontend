import apiClient from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * Servicio para gestionar solicitudes de canciones
 */
export const musicService = {
  /**
   * Obtener todas las solicitudes de canciones
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<{count: number, results: Array}>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS, { params });
    return response.data;
  },

  /**
   * Obtener una solicitud por ID
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUEST_DETAIL(id));
    return response.data;
  },

  /**
   * Crear una nueva solicitud de canción
   * @param {Object} data - Datos de la solicitud {song_name, artist_name, notes?}
   * @returns {Promise<Object>}
   */
  async create(data) {
    const response = await apiClient.post(ENDPOINTS.SONG_REQUESTS, data);
    return response.data;
  },

  /**
   * Actualizar el estado de una solicitud
   * @param {number} id - ID de la solicitud
   * @param {string} status - Nuevo estado (pending, playing, completed, cancelled)
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    const response = await apiClient.post(
      `${ENDPOINTS.SONG_REQUEST_DETAIL(id)}update_status/`,
      { status }
    );
    return response.data;
  },

  /**
   * Eliminar una solicitud
   * @param {number} id - ID de la solicitud
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.SONG_REQUEST_DETAIL(id));
    return response.data;
  },

  // floor: piso (2 | 3) cuya cuenta de Spotify se consulta/controla

  async searchSpotify(query, floor) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS_SEARCH, {
      params: { q: query, floor },
    });
    return response.data;
  },

  async getNowPlaying(floor) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS_NOW_PLAYING, {
      params: { floor },
    });
    return response.data;
  },

  async getQueueStatus(floor) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS_QUEUE_STATUS, {
      params: { floor },
    });
    return response.data;
  },

  async getSpotifyStatus(floor) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS_SPOTIFY_STATUS, {
      params: { floor },
    });
    return response.data;
  },

  async getSpotifyAuthUrl(floor) {
    const response = await apiClient.get(ENDPOINTS.SPOTIFY_AUTH, {
      params: { floor },
    });
    return response.data;
  },

  async disconnectSpotify(floor) {
    const response = await apiClient.post(ENDPOINTS.SPOTIFY_DISCONNECT, { floor });
    return response.data;
  },

  async getLyrics({ trackName, artistName, duration }) {
    const response = await apiClient.get(ENDPOINTS.SONG_REQUESTS_LYRICS, {
      params: { track_name: trackName, artist_name: artistName, duration },
    });
    return response.data;
  },

  async playerPause(floor) {
    const response = await apiClient.post(ENDPOINTS.PLAYER_PAUSE, { floor });
    return response.data;
  },

  async playerResume(floor) {
    const response = await apiClient.post(ENDPOINTS.PLAYER_RESUME, { floor });
    return response.data;
  },

  async playerNext(floor) {
    const response = await apiClient.post(ENDPOINTS.PLAYER_NEXT, { floor });
    return response.data;
  },

  async playerPrevious(floor) {
    const response = await apiClient.post(ENDPOINTS.PLAYER_PREVIOUS, { floor });
    return response.data;
  },

  async playerPlayTrack(trackUri, floor) {
    const response = await apiClient.post(ENDPOINTS.PLAYER_PLAY_TRACK, { track_uri: trackUri, floor });
    return response.data;
  },

  async playerVolume(volume, floor) {
    const response = await apiClient.post(ENDPOINTS.PLAYER_VOLUME, { volume, floor });
    return response.data;
  },

  // Music Settings (source: spotify | youtube)
  async getSettings() {
    const response = await apiClient.get(ENDPOINTS.MUSIC_SETTINGS);
    return response.data;
  },

  async updateSettings(data) {
    const response = await apiClient.patch(ENDPOINTS.MUSIC_SETTINGS, data);
    return response.data;
  },
};

export default musicService;

