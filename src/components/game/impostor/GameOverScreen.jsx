import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { impostorService } from '@/services/impostor.service';
import { themeColorRaw } from '@/lib/themeColors';

const GameOverScreen = () => {
  const navigate = useNavigate();
  const { players, roundHistory, sessionId, resetGame, restartGame } = useImpostorGameStore();
  const finishedRef = useRef(false);
  // Colores de marca leídos una vez del tema; el resto son acentos fijos no-marca.
  const confettiColors = useMemo(
    () => [themeColorRaw('--color-primary'), themeColorRaw('--color-secondary'), '#facc15', '#a855f7', '#ef4444'],
    []
  );

  const lastResult = roundHistory[roundHistory.length - 1];
  const impostorCaught = lastResult?.impostorCaught;

  useEffect(() => {
    if (sessionId && !finishedRef.current) {
      finishedRef.current = true;
      impostorService.finishSession(sessionId, {
        player_scores: players.map((p) => ({
          player_id: p.backendId,
          total_score: 0,
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

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Confetti effect */}
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
              backgroundColor: confettiColors[i % 5],
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
        <p className="text-lg text-gray/60">
          {impostorCaught
            ? 'Los ciudadanos ganaron'
            : 'El impostor gano'}
        </p>
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
