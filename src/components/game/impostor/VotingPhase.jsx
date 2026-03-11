import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { feedbackVote } from '@/utils/gameFeedback';
import PlayerAvatar from './PlayerAvatar';

const VotingPhase = () => {
  const { players, submitGroupVote } = useImpostorGameStore();
  const [selectedId, setSelectedId] = useState(null);

  const handleConfirm = () => {
    if (selectedId) {
      feedbackVote();
      submitGroupVote(selectedId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Vote className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-red-400 mb-1">Votación</h2>
        <p className="text-gray/60 text-sm">
          Entre todos, elijan a quien creen que es el impostor
        </p>
      </motion.div>

      {/* Lista de jugadores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-2"
      >
        {players.map((player) => (
          <motion.button
            key={player.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedId(player.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
              selectedId === player.id
                ? 'border-red-400 bg-red-500/20'
                : 'border-gray/20 bg-dark/40 hover:border-gray/40'
            }`}
          >
            <PlayerAvatar name={player.name} color={player.color} size="sm" />
            <span className="flex-1 text-left text-light font-medium">
              {player.name}
            </span>
            {selectedId === player.id && (
              <Check className="w-5 h-5 text-red-400" />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Confirmar */}
      <Button
        onClick={handleConfirm}
        disabled={!selectedId}
        size="lg"
        className="bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 font-bold px-8 disabled:opacity-40"
      >
        Confirmar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default VotingPhase;
