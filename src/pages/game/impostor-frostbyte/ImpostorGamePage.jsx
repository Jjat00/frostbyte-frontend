import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { CATEGORIES, WORDS } from '@/data/impostorWords';
import RoleReveal from '@/components/game/impostor/RoleReveal';
import ClueRound from '@/components/game/impostor/ClueRound';
import DiscussionPhase from '@/components/game/impostor/DiscussionPhase';
import VotingPhase from '@/components/game/impostor/VotingPhase';
import RoundResults from '@/components/game/impostor/RoundResults';
import GameOverScreen from '@/components/game/impostor/GameOverScreen';
import PlayerAvatar from '@/components/game/impostor/PlayerAvatar';

const ImpostorGamePage = () => {
  const navigate = useNavigate();
  const store = useImpostorGameStore();
  const { phase, players, config, currentRound, usedWords, startRound, goToGameOver } = store;

  useEffect(() => {
    if (players.length === 0 && phase === 'setup') {
      navigate('/game/impostor-frostbyte/setup', { replace: true });
    }
  }, [players, phase, navigate]);

  const handleNextRound = () => {
    if (currentRound >= config.totalRounds) {
      goToGameOver();
      return;
    }

    const slug =
      config.categorySlug ||
      CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].slug;
    const words = WORDS[slug] || [];
    const available = words.filter((w) => !usedWords.includes(w.word));
    const pool = available.length > 0 ? available : words;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    const categoryName = CATEGORIES.find((c) => c.slug === slug)?.name || slug;

    startRound(
      selected?.word || 'Frostbyte',
      config.trapWordEnabled ? selected?.trapWord || null : null,
      categoryName
    );
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
      case 'scoreboard':
        return <ScoreboardPhase onNextRound={handleNextRound} />;
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
        {phase !== 'game-over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-4 pb-2"
          >
            <span className="text-xs text-gray/40 uppercase tracking-widest">
              Impostor Frostbyte
            </span>
          </motion.div>
        )}

        {renderPhase()}
      </div>
    </div>
  );
};

// Scoreboard integrado con la acción de siguiente ronda
const ScoreboardPhase = ({ onNextRound }) => {
  const { players, scores, currentRound, config, goToGameOver } = useImpostorGameStore();
  const isLastRound = currentRound >= config.totalRounds;

  const handleAction = () => {
    if (isLastRound) {
      goToGameOver();
    } else {
      onNextRound();
    }
  };

  const RANK_STYLES = [
    { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' },
    { bg: 'bg-gray/20', border: 'border-gray/40', text: 'text-gray' },
    { bg: 'bg-orange-800/20', border: 'border-orange-800/40', text: 'text-orange-400' },
  ];

  const sortedPlayers = [...players].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  return (
    <div className="flex flex-col items-center gap-8 py-8">
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
                style ? `${style.bg} ${style.border}` : 'bg-dark/40 border-gray/10'
              }`}
            >
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

      <Button
        onClick={handleAction}
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

export default ImpostorGamePage;
