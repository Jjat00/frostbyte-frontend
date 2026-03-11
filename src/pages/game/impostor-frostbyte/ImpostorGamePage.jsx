import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { impostorService } from '@/services/impostor.service';
import { feedbackPhaseChange, feedbackGameOver } from '@/utils/gameFeedback';
import RoleReveal from '@/components/game/impostor/RoleReveal';
import ClueRound from '@/components/game/impostor/ClueRound';
import DiscussionPhase from '@/components/game/impostor/DiscussionPhase';
import VotingPhase from '@/components/game/impostor/VotingPhase';
import RoundResults from '@/components/game/impostor/RoundResults';
import GameOverScreen from '@/components/game/impostor/GameOverScreen';

const ImpostorGamePage = () => {
  const navigate = useNavigate();
  const { phase, players, sessionId, resetGame } = useImpostorGameStore();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (players.length === 0 && phase === 'setup') {
      navigate('/game/impostor-frostbyte/setup', { replace: true });
    }
  }, [players, phase, navigate]);

  // Feedback sonoro/vibración al cambiar de fase
  useEffect(() => {
    if (prevPhaseRef.current !== phase && phase !== 'setup') {
      if (phase === 'game-over') {
        feedbackGameOver();
      } else {
        feedbackPhaseChange();
      }
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const handleExit = () => {
    // Marcar sesión como abandonada en el backend
    if (sessionId) {
      impostorService.finishSession(sessionId, {}).catch(() => {});
    }
    resetGame();
    navigate('/game');
  };

  const renderPhase = () => {
    switch (phase) {
      case 'role-reveal':
        return <RoleReveal />;
      case 'clue-round':
        return <ClueRound />;
      case 'discussion':
        return <DiscussionPhase />;
      case 'voting':
        return <VotingPhase />;
      case 'round-results':
        return <RoundResults />;
      case 'game-over':
        return <GameOverScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-secondary via-dark to-dark-secondary p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        {/* Header con botón de salir */}
        {phase !== 'game-over' && (
          <div className="flex items-center justify-between pt-4 pb-2">
            <span className="text-xs text-gray/40 uppercase tracking-widest flex-1 text-center">
              Impostor Frostbyte
            </span>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-gray/40 hover:text-red-400 transition-colors p-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de confirmación de salida */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-secondary border border-gray/20 rounded-2xl p-6 max-w-sm w-full space-y-4"
            >
              <div className="text-center">
                <LogOut className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-light mb-2">
                  Salir de la partida
                </h3>
                <p className="text-gray/60 text-sm">
                  Se perderá todo el progreso de la partida actual.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowExitConfirm(false)}
                  variant="ghost"
                  className="flex-1 text-gray/60"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleExit}
                  className="flex-1 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                >
                  <X className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImpostorGamePage;
