import { apiClient } from './api/client';

const BASE_URL = '/rooms';
const TABLES_URL = '/tables';

/**
 * Servicio para gestionar el juego Duelo Frostbyte
 */
export const gamesService = {
  // ============= SALAS =============

  /**
   * Crear sala desde QR de mesa
   * @param {Object} data - Datos para crear sala
   * @param {string} data.qr_code - Código QR de la mesa
   * @param {string} data.player_name - Nombre del jugador
   * @param {string} data.player_device_id - ID único del dispositivo
   */
  async createRoomFromQR(data) {
    const response = await apiClient.post(`${BASE_URL}/create-from-qr/`, data);
    return response.data;
  },

  /**
   * Unirse a una sala existente
   * @param {Object} data - Datos para unirse
   * @param {string} data.room_code - Código de la sala (opcional)
   * @param {string} data.room_link - Link de la sala (opcional)
   * @param {string} data.player_name - Nombre del jugador
   * @param {string} data.player_device_id - ID único del dispositivo
   */
  async joinRoom(data) {
    const response = await apiClient.post(`${BASE_URL}/join/`, data);
    return response.data;
  },

  /**
   * Obtener estado de una sala
   * @param {number|string} roomId - ID de la sala
   */
  async getRoomStatus(roomId) {
    const response = await apiClient.get(`${BASE_URL}/${roomId}/status/`);
    return response.data;
  },

  /**
   * Obtener detalle de una sala
   * @param {number|string} roomId - ID de la sala
   */
  async getRoom(roomId) {
    const response = await apiClient.get(`${BASE_URL}/${roomId}/`);
    return response.data;
  },

  /**
   * Configurar número de rondas
   * @param {number|string} roomId - ID de la sala
   * @param {number} totalRounds - Número de rondas (1, 3 o 5)
   */
  async configureRoom(roomId, totalRounds) {
    const response = await apiClient.post(`${BASE_URL}/${roomId}/configure/`, {
      total_rounds: totalRounds,
    });
    return response.data;
  },

  /**
   * Iniciar el juego
   * @param {number|string} roomId - ID de la sala
   */
  async startGame(roomId) {
    const response = await apiClient.post(`${BASE_URL}/${roomId}/start/`);
    return response.data;
  },

  /**
   * Crear ronda y obtener señal (delay)
   * @param {number|string} roomId - ID de la sala
   * @param {number} roundNumber - Número de ronda
   */
  async signalRound(roomId, roundNumber) {
    const response = await apiClient.post(
      `${BASE_URL}/${roomId}/rounds/${roundNumber}/signal/`
    );
    return response.data;
  },

  /**
   * Enviar resultado de ronda
   * @param {number|string} roomId - ID de la sala
   * @param {number} roundNumber - Número de ronda
   * @param {Object} data - Datos del resultado
   * @param {number} data.participant_id - ID del participante
   * @param {number} data.reaction_time_ms - Tiempo de reacción en ms
   */
  async submitResult(roomId, roundNumber, data) {
    const response = await apiClient.post(
      `${BASE_URL}/${roomId}/rounds/${roundNumber}/result/`,
      data
    );
    return response.data;
  },

  /**
   * Descalificar participante por anticipación
   * @param {number|string} roomId - ID de la sala
   * @param {number} roundNumber - Número de ronda
   * @param {number} participantId - ID del participante
   */
  async disqualifyParticipant(roomId, roundNumber, participantId) {
    const response = await apiClient.post(
      `${BASE_URL}/${roomId}/rounds/${roundNumber}/disqualify/`,
      { participant_id: participantId }
    );
    return response.data;
  },

  /**
   * Salir de la sala
   * @param {number|string} roomId - ID de la sala
   * @param {string} playerDeviceId - ID único del dispositivo
   */
  async leaveRoom(roomId, playerDeviceId) {
    const response = await apiClient.post(`${BASE_URL}/${roomId}/leave/`, {
      player_device_id: playerDeviceId,
    });
    return response.data;
  },

  /**
   * Revancha - Crear nueva partida
   * @param {number|string} roomId - ID de la sala
   */
  async rematch(roomId) {
    const response = await apiClient.post(`${BASE_URL}/${roomId}/rematch/`);
    return response.data;
  },

  /**
   * Terminar la sala y el juego para todos los jugadores
   * @param {number|string} roomId - ID de la sala
   */
  async terminateRoom(roomId) {
    const response = await apiClient.post(`${BASE_URL}/${roomId}/terminate/`);
    return response.data;
  },

  // ============= MESAS =============

  /**
   * Obtener todas las mesas
   */
  async getTables() {
    const response = await apiClient.get(`${TABLES_URL}/`);
    return response.data;
  },

  /**
   * Obtener una mesa por ID
   * @param {number|string} tableId - ID de la mesa
   */
  async getTable(tableId) {
    const response = await apiClient.get(`${TABLES_URL}/${tableId}/`);
    return response.data;
  },
};

export default gamesService;

