import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const initialState = {
  // Fases: setup | role-reveal | clue-round | discussion | voting | round-results | game-over
  phase: 'setup',
  players: [],
  config: {
    impostorCount: 1,
    hintEnabled: false,
    trapWordEnabled: false,
    spyEnabled: false,
    turnTimerSeconds: 30,
    discussionTimerSeconds: 120,
    totalRounds: 3,
    categorySlug: null,
    categoryName: null,
    useAiWords: false,
  },

  // Sesión backend (trazabilidad)
  sessionId: null,

  // Partida actual (misma palabra durante toda la partida)
  currentWord: null,
  currentTrapWord: null,
  currentCategory: null,
  impostorIds: [],
  spyId: null,

  // Rondas de pistas (cada ronda = todos los jugadores dan 1 pista)
  currentClueRound: 0,

  // Control de revelación
  revealIndex: 0,
  revealedPlayers: [],

  // Control de pistas (índice del jugador actual dentro de la ronda)
  cluePlayerIndex: 0,
  cluePlayerOrder: [], // orden aleatorio de índices para la ronda actual

  // Control de votación
  votedPlayerId: null,

  // Historial
  roundHistory: [],

  // Palabras usadas en sesiones anteriores (para no repetir al jugar de nuevo)
  usedWords: [],
};

export const useImpostorGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ============= SETUP =============

      addPlayer: (name, color) =>
        set((state) => ({
          players: [
            ...state.players,
            { id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, color },
          ],
        })),

      removePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      updateConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),

      setSessionId: (sessionId) => set({ sessionId }),

      // ============= GAME START =============

      startGame: (word, trapWord, category) => {
        const state = get();
        const playerIds = state.players.map((p) => p.id);

        // Seleccionar impostores aleatoriamente
        const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
        const impostorIds = shuffled.slice(0, state.config.impostorCount);

        // Seleccionar espía (si está habilitado) - no puede ser impostor
        let spyId = null;
        if (state.config.spyEnabled) {
          const normalPlayers = playerIds.filter((id) => !impostorIds.includes(id));
          if (normalPlayers.length > 0) {
            spyId = normalPlayers[Math.floor(Math.random() * normalPlayers.length)];
          }
        }

        set({
          phase: 'role-reveal',
          currentWord: word,
          currentTrapWord: trapWord,
          currentCategory: category,
          impostorIds,
          spyId,
          currentClueRound: 1,
          revealIndex: 0,
          revealedPlayers: [],
          cluePlayerIndex: 0,
          cluePlayerOrder: shuffleArray(state.players.map((_, i) => i)),
          votedPlayerId: null,
          usedWords: [...state.usedWords, word],
        });
      },

      // ============= ROLE REVEAL =============

      advanceReveal: () =>
        set((state) => {
          const currentPlayer = state.players[state.revealIndex];
          const newRevealed = [...state.revealedPlayers, currentPlayer.id];
          const nextIndex = state.revealIndex + 1;

          if (nextIndex >= state.players.length) {
            return {
              revealedPlayers: newRevealed,
              revealIndex: nextIndex,
              phase: 'clue-round',
            };
          }

          return {
            revealedPlayers: newRevealed,
            revealIndex: nextIndex,
          };
        }),

      // ============= CLUE ROUND =============
      // Cada ronda de pistas = todos los jugadores dan 1 pista
      // Después de la última ronda de pistas → discusión → votación

      advanceClue: () =>
        set((state) => {
          const nextPlayerIndex = state.cluePlayerIndex + 1;

          // Si quedan jugadores en esta ronda de pistas
          if (nextPlayerIndex < state.players.length) {
            return { cluePlayerIndex: nextPlayerIndex };
          }

          // Todos los jugadores dieron pista en esta ronda
          const nextClueRound = state.currentClueRound + 1;

          // Si quedan más rondas de pistas → nueva ronda, nuevo orden aleatorio
          if (nextClueRound <= state.config.totalRounds) {
            return {
              cluePlayerIndex: 0,
              cluePlayerOrder: shuffleArray(state.players.map((_, i) => i)),
              currentClueRound: nextClueRound,
            };
          }

          // Todas las rondas de pistas terminaron → ir a discusión o votación
          return {
            cluePlayerIndex: nextPlayerIndex,
            phase: state.config.discussionTimerSeconds ? 'discussion' : 'voting',
          };
        }),

      goToDiscussion: () => set({ phase: 'discussion' }),

      goToVoting: () => set({ phase: 'voting', votedPlayerId: null }),

      // ============= VOTING =============

      submitGroupVote: (playerId) =>
        set((state) => {
          const impostorCaught = state.impostorIds.includes(playerId);

          const gameResult = {
            word: state.currentWord,
            trapWord: state.currentTrapWord,
            category: state.currentCategory,
            totalClueRounds: state.config.totalRounds,
            impostorIds: [...state.impostorIds],
            spyId: state.spyId,
            impostorCaught,
            votedPlayerId: playerId,
          };

          return {
            votedPlayerId: playerId,
            roundHistory: [...state.roundHistory, gameResult],
            phase: 'round-results',
          };
        }),

      goToGameOver: () => set({ phase: 'game-over' }),

      // ============= RESET =============

      restartGame: () =>
        set((state) => ({
          ...initialState,
          players: state.players,
          config: state.config,
          usedWords: state.usedWords,
        })),

      resetGame: () => set({ ...initialState }),
    }),
    {
      name: 'frostbyte-impostor-game',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useImpostorGameStore;
