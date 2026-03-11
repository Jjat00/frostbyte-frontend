import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { impostorService } from '@/services/impostor.service';
import PlayerAvatar from './PlayerAvatar';

const RoundResults = () => {
  const {
    players,
    impostorIds,
    spyId,
    votedPlayerId,
    currentWord,
    currentTrapWord,
    config,
    goToGameOver,
    sessionId,
  } = useImpostorGameStore();

  const savedRef = useRef(false);

  const impostorCaught = impostorIds.includes(votedPlayerId);
  const votedPlayer = players.find((p) => p.id === votedPlayerId);
  const impostorPlayers = players.filter((p) => impostorIds.includes(p.id));

  useEffect(() => {
    if (!savedRef.current && sessionId) {
      savedRef.current = true;

      const playerResults = players.map((p) => ({
        player_id: p.backendId,
        role: impostorIds.includes(p.id) ? 'impostor' : spyId === p.id ? 'spy' : 'normal',
        votes_received: p.id === votedPlayerId ? 1 : 0,
        points_earned: 0,
      }));

      impostorService.saveRound(sessionId, {
        round_number: 1,
        category_slug: config.categorySlug || 'random',
        word: currentWord,
        trap_word: currentTrapWord || '',
        impostor_caught: impostorCaught,
        player_results: playerResults,
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Resultado principal */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className={`text-center px-8 py-6 rounded-3xl border-2 ${
          impostorCaught
            ? 'bg-emerald-500/10 border-emerald-500/40'
            : 'bg-red-500/10 border-red-500/40'
        }`}
      >
        {impostorCaught ? (
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
              El impostor escap&oacute;
            </h2>
          </>
        )}
      </motion.div>

      {/* A quien votaron */}
      {votedPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <p className="text-gray/60 text-sm">Votaron por:</p>
          <div className="flex flex-col items-center gap-2">
            <PlayerAvatar name={votedPlayer.name} color={votedPlayer.color} size="lg" />
            <span className="text-light font-bold text-lg">{votedPlayer.name}</span>
          </div>
        </motion.div>
      )}

      {/* Quien era el impostor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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
        transition={{ delay: 0.9 }}
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

      {/* Accion */}
      <Button
        onClick={goToGameOver}
        size="lg"
        className="bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 font-bold px-8"
      >
        Continuar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default RoundResults;
