import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { impostorService } from '@/services/impostor.service';
import PlayerAvatar from './PlayerAvatar';

const RoundResults = () => {
  const {
    players,
    impostorIds,
    spyId,
    currentWord,
    currentTrapWord,
    currentCategory,
    currentRound,
    config,
    roundHistory,
    calculateRoundResults,
    goToScoreboard,
    sessionId,
  } = useImpostorGameStore();

  const [result, setResult] = useState(null);
  const calculatedRef = useRef(false);

  useEffect(() => {
    if (!calculatedRef.current) {
      calculatedRef.current = true;
      const roundResult = calculateRoundResults();
      setResult(roundResult);

      // Guardar ronda en backend para trazabilidad
      if (sessionId) {
        const playerResults = players.map((p) => ({
          player_id: p.backendId,
          role: impostorIds.includes(p.id) ? 'impostor' : spyId === p.id ? 'spy' : 'normal',
          voted_for_id: roundResult.voteCounts?.[p.id] ? undefined : undefined,
          votes_received: roundResult.voteCounts?.[p.id] || 0,
          points_earned: roundResult.roundPoints?.[p.id] || 0,
        }));

        impostorService.saveRound(sessionId, {
          round_number: currentRound,
          category_slug: config.categorySlug || 'random',
          word: currentWord,
          trap_word: currentTrapWord || '',
          impostor_caught: roundResult.impostorCaught,
          player_results: playerResults,
        }).catch(() => {});
      }
    }
  }, []);

  if (!result) return null;

  const impostorPlayers = players.filter((p) => impostorIds.includes(p.id));
  const isLastRound = currentRound >= config.totalRounds;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Resultado principal */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className={`text-center px-8 py-6 rounded-3xl border-2 ${
          result.impostorCaught
            ? 'bg-emerald-500/10 border-emerald-500/40'
            : 'bg-red-500/10 border-red-500/40'
        }`}
      >
        {result.impostorCaught ? (
          <>
            <Check className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">
              Impostor descubierto
            </h2>
          </>
        ) : (
          <>
            <X className="w-16 h-16 text-red-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              El impostor escapó
            </h2>
          </>
        )}
      </motion.div>

      {/* Quién era el impostor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-3"
      >
        <p className="text-gray/60 text-sm">
          {impostorPlayers.length > 1 ? 'Los impostores eran:' : 'El impostor era:'}
        </p>
        <div className="flex gap-4 justify-center">
          {impostorPlayers.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <div className="relative">
                <PlayerAvatar name={p.name} color={p.color} size="lg" />
                <AlertTriangle className="w-5 h-5 text-red-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-light font-bold">{p.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Palabra real */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center bg-dark-secondary/60 border border-gray/20 rounded-2xl px-6 py-4 space-y-2"
      >
        <p className="text-gray/50 text-sm">La palabra era:</p>
        <p className="text-3xl font-bold text-secondary">{currentWord}</p>
        {currentTrapWord && (
          <p className="text-sm text-gray/40">
            Palabra trampa: <span className="text-red-300">{currentTrapWord}</span>
          </p>
        )}
      </motion.div>

      {/* Puntos de la ronda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full max-w-sm space-y-2"
      >
        <h3 className="text-sm font-bold text-gray/60 text-center mb-3">
          Puntos esta ronda
        </h3>
        {players
          .sort((a, b) => (result.roundPoints[b.id] || 0) - (result.roundPoints[a.id] || 0))
          .map((player) => {
            const points = result.roundPoints[player.id] || 0;
            return (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-dark/40 border border-gray/10 rounded-xl px-4 py-2"
              >
                <PlayerAvatar name={player.name} color={player.color} size="sm" />
                <span className="flex-1 text-light text-sm">{player.name}</span>
                <span
                  className={`font-bold ${
                    points > 0 ? 'text-emerald-400' : 'text-gray/40'
                  }`}
                >
                  {points > 0 ? `+${points}` : '0'}
                </span>
              </div>
            );
          })}
      </motion.div>

      {/* Acción */}
      <Button
        onClick={goToScoreboard}
        size="lg"
        className="bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 font-bold px-8"
      >
        {isLastRound ? (
          <>
            <Trophy className="w-5 h-5 mr-2" />
            Ver resultados finales
          </>
        ) : (
          <>
            Ver puntuación
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default RoundResults;
