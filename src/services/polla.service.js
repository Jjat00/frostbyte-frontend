import apiClient from "./api/client";
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
  async getTopScorers() {
    // { scorers: [...], updated_at }
    return (await customerClient.get(ENDPOINTS.POLLA_TOPSCORERS)).data;
  },
  async getTeam(code) {
    // { team, standing, players, matches }
    return (await customerClient.get(ENDPOINTS.POLLA_TEAM_DETAIL(code))).data;
  },
  async getPlayer(id) {
    // { id, name, number, position, age, photo, team, profile, tournament }
    return (await customerClient.get(ENDPOINTS.POLLA_PLAYER_DETAIL(id))).data;
  },
  async getMatchPulse(slug) {
    // { visible, total, outcomes, top_scores } | { visible: false, reason }
    return (await customerClient.get(ENDPOINTS.POLLA_MATCH_PULSE(slug))).data;
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
  async getParticipant(userId) {
    // Perfil público de un participante del ranking:
    // { user, score, missions, predictions, is_you }
    return (await customerClient.get(ENDPOINTS.POLLA_PARTICIPANT(userId))).data;
  },
  async getMissions() {
    return (await customerClient.get(ENDPOINTS.POLLA_MISSIONS)).data;
  },
  async getMyStats() {
    return (await customerClient.get(ENDPOINTS.POLLA_MY_STATS)).data;
  },
  async getReferral() {
    // { code, invited, qualified, points, cap, points_per }
    return (await customerClient.get(ENDPOINTS.POLLA_REFERRAL)).data;
  },
  async getGranizado() {
    // { rewards: [{ id, code, status, match, match_number, issued_at, expires_at, redeemed_at }] }
    return (await customerClient.get(ENDPOINTS.POLLA_GRANIZADO)).data;
  },
  async redeemGranizado(id) {
    // { reward } en exito; { detail, reward? } en error (ya entregado / vencido)
    return (await customerClient.post(ENDPOINTS.POLLA_GRANIZADO_REDEEM(id))).data;
  },
  async claimReferral(code) {
    return (
      await customerClient.post(ENDPOINTS.POLLA_REFERRAL_CLAIM, { code })
    ).data;
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

  // ── Administración (sesión de staff: requiere rol admin) ──
  // Usan `apiClient` (token de staff), NO el customerClient: el backend
  // protege estos endpoints con IsAdminUser.
  async adminOverview() {
    return (await apiClient.get(ENDPOINTS.POLLA_ADMIN_OVERVIEW)).data;
  },
  async adminPlayers(q = "") {
    const params = q ? { q } : {};
    return (await apiClient.get(ENDPOINTS.POLLA_ADMIN_PLAYERS, { params })).data;
  },
  async adminPlayer(userId) {
    return (await apiClient.get(ENDPOINTS.POLLA_ADMIN_PLAYER(userId))).data;
  },
  async adminAwards() {
    return (await apiClient.get(ENDPOINTS.POLLA_ADMIN_AWARDS)).data;
  },
  async adminResolveAward(payload) {
    // payload: { code, team_code } | { code, player_id } | { code, clear: true }
    return (await apiClient.post(ENDPOINTS.POLLA_ADMIN_RESOLVE_AWARD, payload)).data;
  },
};

export default pollaService;
