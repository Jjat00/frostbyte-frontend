import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import useCountdownTimer from '@/hooks/useCountdownTimer';
import PlayerAvatar from './PlayerAvatar';
import CyberpunkTimer from './CyberpunkTimer';

const ClueRound = () => {
  const { players, cluePlayerIndex, currentClueRound, config, advanceClue } =
    useImpostorGameStore();

  const currentPlayer = players[cluePlayerIndex];
  const isLastPlayerInRound = cluePlayerIndex >= players.length - 1;
  const isLastRound = currentClueRound >= config.totalRounds;
  const hasTimer = config.turnTimerSeconds != null;

  const { timeLeft, start } = useCountdownTimer(
    config.turnTimerSeconds || 30,
    { onComplete: advanceClue }
  );

  // Reiniciar timer cada vez que cambia el jugador o la ronda
  useEffect(() => {
    if (hasTimer && currentPlayer) {
      start();
    }
  }, [cluePlayerIndex, currentClueRound]);

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
            Ronda de Pistas {currentClueRound}/{config.totalRounds}
          </h2>
        </div>
        <p className="text-sm text-gray/50">
          Di una palabra relacionada (sin decir la palabra exacta)
        </p>
      </motion.div>

      {/* Indicador de rondas */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: config.totalRounds }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i + 1 < currentClueRound
                ? 'w-8 bg-secondary'
                : i + 1 === currentClueRound
                ? 'w-10 bg-secondary animate-pulse'
                : 'w-8 bg-gray/20'
            }`}
          />
        ))}
      </div>

      {/* Progreso de jugadores en esta ronda */}
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
        key={`${currentClueRound}-${currentPlayer.id}`}
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
        {isLastPlayerInRound && isLastRound
          ? 'Ir a discusión'
          : isLastPlayerInRound
          ? `Siguiente ronda (${currentClueRound + 1}/${config.totalRounds})`
          : 'Siguiente jugador'}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default ClueRound;
