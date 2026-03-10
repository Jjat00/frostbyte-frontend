import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import useCountdownTimer from '@/hooks/useCountdownTimer';
import PlayerAvatar from './PlayerAvatar';
import CyberpunkTimer from './CyberpunkTimer';

const DiscussionPhase = () => {
  const { players, config, goToVoting } = useImpostorGameStore();
  const hasTimer = config.discussionTimerSeconds != null;

  const { timeLeft } = useCountdownTimer(
    config.discussionTimerSeconds || 120,
    {
      onComplete: goToVoting,
      autoStart: hasTimer,
    }
  );

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MessageCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-amber-400 mb-2">Discusión</h2>
        <p className="text-gray/60">
          Debatan quién creen que es el impostor
        </p>
      </motion.div>

      {/* Timer */}
      {hasTimer && (
        <CyberpunkTimer
          timeLeft={timeLeft}
          duration={config.discussionTimerSeconds}
          size={140}
        />
      )}

      {/* Lista de jugadores */}
      <div className="grid grid-cols-3 gap-4">
        {players.map((player) => (
          <motion.div
            key={player.id}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
            className="flex flex-col items-center gap-2"
          >
            <PlayerAvatar name={player.name} color={player.color} size="md" />
            <span className="text-xs text-light font-medium">{player.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Botón de votación */}
      <Button
        onClick={goToVoting}
        size="lg"
        className="bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 font-bold px-8"
      >
        <Vote className="w-5 h-5 mr-2" />
        Ir a votación
      </Button>
    </div>
  );
};

export default DiscussionPhase;
