import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Vote, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import PlayerAvatar from './PlayerAvatar';

const VotingPhase = () => {
  const { players, votePlayerIndex, votes, submitVote, advanceVote } =
    useImpostorGameStore();

  const [selectedVote, setSelectedVote] = useState(null);
  const [showVoteUI, setShowVoteUI] = useState(false);

  const currentVoter = players[votePlayerIndex];
  const allVoted = votePlayerIndex >= players.length;

  if (allVoted || !currentVoter) return null;

  const otherPlayers = players.filter((p) => p.id !== currentVoter.id);

  const handleConfirmVote = () => {
    if (selectedVote) {
      submitVote(currentVoter.id, selectedVote);
    }
    setSelectedVote(null);
    setShowVoteUI(false);
    advanceVote();
  };

  const handleSkipVote = () => {
    setSelectedVote(null);
    setShowVoteUI(false);
    advanceVote();
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
        <h2 className="text-2xl font-bold text-red-400">Votación</h2>
      </motion.div>

      {/* Progreso */}
      <div className="flex gap-2">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`w-3 h-3 rounded-full transition-all ${
              i < votePlayerIndex
                ? 'bg-red-400'
                : i === votePlayerIndex
                ? 'bg-red-400 animate-pulse w-4 h-4'
                : 'bg-gray/30'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!showVoteUI ? (
          /* Pantalla de pase de celular */
          <motion.div
            key="pass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <Smartphone className="w-10 h-10 text-secondary" />
            <p className="text-gray/60 text-sm">Pasa el celular a:</p>
            <PlayerAvatar
              name={currentVoter.name}
              color={currentVoter.color}
              size="lg"
            />
            <h3 className="text-2xl font-bold text-light">{currentVoter.name}</h3>
            <Button
              onClick={() => setShowVoteUI(true)}
              size="lg"
              className="bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 font-bold px-8"
            >
              Votar
            </Button>
          </motion.div>
        ) : (
          /* UI de votación */
          <motion.div
            key="vote"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm space-y-4"
          >
            <p className="text-center text-gray/60 text-sm">
              {currentVoter.name}, ¿quién crees que es el impostor?
            </p>

            <div className="space-y-2">
              {otherPlayers.map((player) => (
                <motion.button
                  key={player.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedVote(player.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedVote === player.id
                      ? 'border-red-400 bg-red-500/20'
                      : 'border-gray/20 bg-dark/40 hover:border-gray/40'
                  }`}
                >
                  <PlayerAvatar name={player.name} color={player.color} size="sm" />
                  <span className="flex-1 text-left text-light font-medium">
                    {player.name}
                  </span>
                  {selectedVote === player.id && (
                    <Check className="w-5 h-5 text-red-400" />
                  )}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSkipVote}
                variant="ghost"
                className="flex-1 text-gray/60"
              >
                Abstenerme
              </Button>
              <Button
                onClick={handleConfirmVote}
                disabled={!selectedVote}
                className="flex-1 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 disabled:opacity-40"
              >
                Confirmar voto
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VotingPhase;
