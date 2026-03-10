import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import useCountdownTimer from '@/hooks/useCountdownTimer';
import PlayerAvatar from './PlayerAvatar';
import CyberpunkTimer from './CyberpunkTimer';

const ClueRound = () => {
  const { players, cluePlayerIndex, config, currentRound, advanceClue } =
    useImpostorGameStore();

  const currentPlayer = players[cluePlayerIndex];
  const isLastPlayer = cluePlayerIndex >= players.length - 1;
  const hasTimer = config.turnTimerSeconds != null;

  const { timeLeft, isRunning, start } = useCountdownTimer(
    config.turnTimerSeconds || 30,
    {
      onComplete: advanceClue,
      autoStart: hasTimer,
    }
  );

  if (!currentPlayer) return null;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center gap-2 justify-center mb-2">
          <MessageSquare className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-bold text-secondary">
            Ronda de Pistas - R{currentRound}
          </h2>
        </div>
        <p className="text-sm text-gray/50">
          Di una palabra relacionada (sin decir la palabra exacta)
        </p>
      </motion.div>

      {/* Progreso de jugadores */}
      <div className="flex gap-3 flex-wrap justify-center">
        {players.map((p, i) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <PlayerAvatar
              name={p.name}
              color={p.color}
              size="sm"
              className={
                i < cluePlayerIndex
                  ? 'opacity-40'
                  : i === cluePlayerIndex
                  ? 'ring-2 ring-secondary ring-offset-2 ring-offset-dark'
                  : 'opacity-60'
              }
            />
            <span
              className={`text-xs ${
                i === cluePlayerIndex ? 'text-secondary font-bold' : 'text-gray/40'
              }`}
            >
              {p.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Jugador actual */}
      <motion.div
        key={currentPlayer.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <PlayerAvatar name={currentPlayer.name} color={currentPlayer.color} size="xl" />
        <h3 className="text-2xl font-bold text-light">{currentPlayer.name}</h3>
        <p className="text-gray/60">Es tu turno de dar una pista</p>
      </motion.div>

      {/* Timer */}
      {hasTimer && (
        <CyberpunkTimer
          timeLeft={timeLeft}
          duration={config.turnTimerSeconds}
          size={100}
        />
      )}

      {/* Botón siguiente */}
      <Button
        onClick={advanceClue}
        size="lg"
        className="bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 font-bold px-8"
      >
        {isLastPlayer ? 'Ir a discusión' : 'Siguiente jugador'}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default ClueRound;
