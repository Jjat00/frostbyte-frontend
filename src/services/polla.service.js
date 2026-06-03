import customerClient from "./api/customerClient";
import { ENDPOINTS } from "./api/endpoints";

/**
 * Servicio de la Polla Mundialista 2026.
 *
 * Usa el `customerClient` (sesión de cliente con Google): las lecturas
 * funcionan con o sin sesión, y las escrituras (pronósticos, menciones)
 * adjuntan automáticamente el token del cliente.
 */
export const pollaService = {
  // ── Lecturas ──
  async getTournament() {
    return (await customerClient.get(ENDPOINTS.POLLA_TOURNAMENT)).data;
  },
  async getMatches(params = {}) {
    return (await customerClient.get(ENDPOINTS.POLLA_MATCHES, { params })).data;
  },
  async getMatch(slug) {
    return (await customerClient.get(ENDPOINTS.POLLA_MATCH_DETAIL(slug))).data;
  },
  async getMyPredictions() {
    return (await customerClient.get(ENDPOINTS.POLLA_MY_PREDICTIONS)).data;
  },
  async getGroups() {
    return (await customerClient.get(ENDPOINTS.POLLA_GROUPS)).data;
  },
  async getStandings() {
    return (await customerClient.get(ENDPOINTS.POLLA_STANDINGS)).data;
  },
  async getAwards() {
    return (await customerClient.get(ENDPOINTS.POLLA_AWARDS)).data;
  },
  async getBracket() {
    return (await customerClient.get(ENDPOINTS.POLLA_BRACKET)).data;
  },
  async getRanking() {
    return (await customerClient.get(ENDPOINTS.POLLA_RANKING)).data;
  },
  async getMissions() {
    return (await customerClient.get(ENDPOINTS.POLLA_MISSIONS)).data;
  },
  async getMyStats() {
    return (await customerClient.get(ENDPOINTS.POLLA_MY_STATS)).data;
  },

  // ── Escrituras (requieren sesión de cliente) ──
  async savePrediction(slug, { home_score, away_score }) {
    return (
      await customerClient.put(ENDPOINTS.POLLA_MATCH_PREDICT(slug), {
        home_score,
        away_score,
      })
    ).data;
  },
  async saveAwardPick(code, payload) {
    // payload: { team_code } | { player_id }
    return (await customerClient.put(ENDPOINTS.POLLA_AWARD_PICK(code), payload)).data;
  },
  async clearAwardPick(code) {
    // Quita la elección de la mención (la deja vacía).
    return (await customerClient.delete(ENDPOINTS.POLLA_AWARD_PICK(code))).data;
  },
  async saveBracketPick(slug, { winner_code }) {
    // Devuelve el bracket completo, ya propagado.
    return (
      await customerClient.put(ENDPOINTS.POLLA_BRACKET_PICK(slug), { winner_code })
    ).data;
  },
};

export default pollaService;
