import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import PlayerAvatar from './PlayerAvatar';

const RANK_STYLES = [
  { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' },
  { bg: 'bg-gray/20', border: 'border-gray/40', text: 'text-gray' },
  { bg: 'bg-orange-800/20', border: 'border-orange-800/40', text: 'text-orange-400' },
];

const Scoreboard = () => {
  const { players, scores, currentRound, config, goToGameOver } = useImpostorGameStore();

  const isLastRound = currentRound >= config.totalRounds;

  const sortedPlayers = [...players].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-light">Puntuación</h2>
        <p className="text-gray/50 text-sm">
          Ronda {currentRound} de {config.totalRounds}
        </p>
      </motion.div>

      {/* Rankings */}
      <div className="w-full max-w-sm space-y-3">
        {sortedPlayers.map((player, index) => {
          const score = scores[player.id] || 0;
          const style = index < 3 ? RANK_STYLES[index] : null;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                style
                  ? `${style.bg} ${style.border}`
                  : 'bg-dark/40 border-gray/10'
              }`}
            >
              {/* Posición */}
              <div className="w-8 text-center">
                {index === 0 ? (
                  <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                ) : (
                  <span className={`font-bold ${style?.text || 'text-gray/40'}`}>
                    {index + 1}
                  </span>
                )}
              </div>

              <PlayerAvatar name={player.name} color={player.color} size="sm" />
              <span className="flex-1 text-light font-medium">{player.name}</span>
              <span className={`text-lg font-bold ${style?.text || 'text-gray/60'}`}>
                {score}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Acción */}
      <Button
        onClick={goToGameOver}
        size="lg"
        className={`font-bold px-8 ${
          isLastRound
            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
            : 'bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30'
        }`}
      >
        {isLastRound ? (
          <>
            <Trophy className="w-5 h-5 mr-2" />
            Ver ganador
          </>
        ) : (
          <>
            Siguiente ronda
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default Scoreboard;
