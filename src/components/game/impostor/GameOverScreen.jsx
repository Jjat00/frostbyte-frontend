import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, RotateCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { impostorService } from '@/services/impostor.service';
import PlayerAvatar from './PlayerAvatar';

const GameOverScreen = () => {
  const navigate = useNavigate();
  const { players, scores, roundHistory, sessionId, resetGame, restartGame } = useImpostorGameStore();
  const finishedRef = useRef(false);

  const sortedPlayers = [...players].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  const winner = sortedPlayers[0];

  // Marcar sesión como completada en el backend
  useEffect(() => {
    if (sessionId && !finishedRef.current) {
      finishedRef.current = true;
      impostorService.finishSession(sessionId, {
        player_scores: players.map((p) => ({
          player_id: p.backendId,
          total_score: scores[p.id] || 0,
        })),
      }).catch(() => {});
    }
  }, []);

  const handlePlayAgain = () => {
    restartGame();
    navigate('/game/impostor-frostbyte/setup');
  };

  const handleExit = () => {
    resetGame();
    navigate('/game');
  };

  // Stats
  const totalImpostorsCaught = roundHistory.filter((r) => r.impostorCaught).length;
  const totalRounds = roundHistory.length;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Confetti-like effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 400 - 200,
              y: -20,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: 600,
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: 0,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
            className="absolute left-1/2 w-3 h-3 rounded-sm"
            style={{
              backgroundColor: ['#ff00d4', '#00e0ff', '#facc15', '#a855f7', '#ef4444'][
                i % 5
              ],
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center relative z-10"
      >
        <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-light mb-2">Fin del juego</h1>
      </motion.div>

      {/* Ganador */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl px-8 py-6 relative z-10"
        >
          <Crown className="w-8 h-8 text-amber-400" />
          <PlayerAvatar name={winner.name} color={winner.color} size="xl" />
          <h2 className="text-2xl font-bold text-amber-400">{winner.name}</h2>
          <p className="text-4xl font-bold text-light">{scores[winner.id] || 0} pts</p>
        </motion.div>
      )}

      {/* Rankings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm space-y-2 relative z-10"
      >
        {sortedPlayers.slice(1).map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-3 bg-dark/40 border border-gray/10 rounded-xl px-4 py-2"
          >
            <span className="w-6 text-center text-gray/40 font-bold">{index + 2}</span>
            <PlayerAvatar name={player.name} color={player.color} size="sm" />
            <span className="flex-1 text-light text-sm">{player.name}</span>
            <span className="text-gray/60 font-bold">{scores[player.id] || 0}</span>
          </div>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-6 text-center relative z-10"
      >
        <div>
          <p className="text-2xl font-bold text-secondary">{totalRounds}</p>
          <p className="text-xs text-gray/50">Rondas</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-400">{totalImpostorsCaught}</p>
          <p className="text-xs text-gray/50">Atrapados</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">
            {totalRounds - totalImpostorsCaught}
          </p>
          <p className="text-xs text-gray/50">Escaparon</p>
        </div>
      </motion.div>

      {/* Acciones */}
      <div className="flex gap-4 relative z-10">
        <Button
          onClick={handlePlayAgain}
          size="lg"
          className="bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 font-bold"
        >
          <RotateCw className="w-5 h-5 mr-2" />
          Jugar de nuevo
        </Button>
        <Button
          onClick={handleExit}
          size="lg"
          variant="ghost"
          className="text-gray/60"
        >
          <Home className="w-5 h-5 mr-2" />
          Salir
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
