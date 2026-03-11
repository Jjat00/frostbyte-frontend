import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import PlayerAvatar from './PlayerAvatar';
import RevealCard from './RevealCard';

const RoleReveal = () => {
  const {
    players,
    revealIndex,
    revealedPlayers,
    impostorIds,
    spyId,
    currentWord,
    currentTrapWord,
    currentCategory,
    config,
    advanceReveal,
  } = useImpostorGameStore();

  const currentPlayer = players[revealIndex];
  const allRevealed = revealIndex >= players.length;

  if (allRevealed) return null;

  const isRevealed = revealedPlayers.includes(currentPlayer.id);

  const getRole = (playerId) => {
    if (impostorIds.includes(playerId)) return 'impostor';
    if (spyId === playerId) return 'spy';
    return 'normal';
  };

  const role = getRole(currentPlayer.id);

  // Para el espía, encontrar el nombre del impostor
  const spyTarget =
    role === 'spy' && impostorIds.length > 0
      ? players
          .filter((p) => impostorIds.includes(p.id))
          .map((p) => p.name)
          .join(', ')
      : null;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Progreso */}
      <div className="flex gap-2">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`w-3 h-3 rounded-full transition-all ${
              i < revealIndex
                ? 'bg-secondary'
                : i === revealIndex
                ? 'bg-secondary animate-pulse w-4 h-4'
                : 'bg-gray/30'
            }`}
          />
        ))}
      </div>

      {/* Instrucción de pase */}
      {!isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Smartphone className="w-10 h-10 text-secondary mx-auto" />
          <p className="text-gray/60 text-sm">Pasa el celular a:</p>
          <div className="flex flex-col items-center gap-3">
            <PlayerAvatar name={currentPlayer.name} color={currentPlayer.color} size="lg" />
            <h2 className="text-2xl font-bold text-light">{currentPlayer.name}</h2>
          </div>
        </motion.div>
      )}

      {/* Carta de revelación */}
      <RevealCard
        role={role}
        word={currentWord}
        trapWord={currentTrapWord}
        category={currentCategory}
        hintEnabled={config.hintEnabled}
        trapWordEnabled={config.trapWordEnabled}
        spyTarget={spyTarget}
        onDone={advanceReveal}
      />
    </div>
  );
};

export default RoleReveal;
