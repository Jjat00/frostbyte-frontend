import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImpostorGameStore from '@/stores/useImpostorGameStore';
import { impostorService } from '@/services/impostor.service';
import { CATEGORIES, WORDS } from '@/data/impostorWords';
import PlayerSetup from '@/components/game/impostor/PlayerSetup';
import GameConfig from '@/components/game/impostor/GameConfig';

const ImpostorSetupPage = () => {
  const navigate = useNavigate();
  const {
    players,
    config,
    addPlayer,
    removePlayer,
    updateConfig,
    startRound,
    setSessionId,
    resetGame,
    phase,
  } = useImpostorGameStore();

  // Si hay un juego en progreso, ir directamente al juego
  useEffect(() => {
    if (phase !== 'setup' && phase !== 'setup-round') {
      navigate('/game/impostor-frostbyte/play', { replace: true });
    }
  }, []);

  const canStart = players.length >= 3;

  const getRandomWord = (categorySlug, usedWords = []) => {
    const slug = categorySlug || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].slug;
    const words = WORDS[slug];
    if (!words) return { word: 'Frostbyte', trapWord: 'Icebyte', category: slug };

    const available = words.filter((w) => !usedWords.includes(w.word));
    const pool = available.length > 0 ? available : words;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    const categoryName = CATEGORIES.find((c) => c.slug === slug)?.name || slug;

    return {
      word: selected.word,
      trapWord: config.trapWordEnabled ? selected.trapWord : null,
      category: categoryName,
    };
  };

  const handleStartGame = async () => {
    // Obtener palabra
    const { word, trapWord, category } = getRandomWord(config.categorySlug);

    // Crear sesión en backend para trazabilidad
    try {
      const session = await impostorService.createSession({
        total_rounds: config.totalRounds,
        impostor_count: config.impostorCount,
        hint_enabled: config.hintEnabled,
        trap_word_enabled: config.trapWordEnabled,
        spy_enabled: config.spyEnabled,
        turn_timer_seconds: config.turnTimerSeconds,
        ai_words_used: config.useAiWords,
        players: players.map((p) => ({ name: p.name, color: p.color })),
      });

      setSessionId(session.id);

      // Mapear IDs del backend a los jugadores locales
      if (session.players) {
        session.players.forEach((bp, i) => {
          if (players[i]) {
            players[i].backendId = bp.id;
          }
        });
      }
    } catch {
      // Si falla la conexión, jugar sin trazabilidad
      console.warn('No se pudo crear sesión en backend, jugando offline');
    }

    startRound(word, trapWord, category);
    navigate('/game/impostor-frostbyte/play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-secondary via-dark to-dark-secondary p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto relative z-10 py-8">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => {
              resetGame();
              navigate(-1);
            }}
            className="text-gray hover:text-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">🕵️</div>
          <h1 className="text-3xl font-bold text-light tracking-wider">
            Impostor Frostbyte
          </h1>
          <p className="text-gray/60 mt-2">Configura tu partida</p>
        </motion.div>

        {/* Contenido */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-secondary/80 backdrop-blur-xl border border-gray/20 rounded-2xl p-6"
          >
            <PlayerSetup
              players={players}
              onAddPlayer={addPlayer}
              onRemovePlayer={removePlayer}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-secondary/80 backdrop-blur-xl border border-gray/20 rounded-2xl p-6"
          >
            <GameConfig
              config={config}
              onUpdateConfig={updateConfig}
              playerCount={players.length}
            />
          </motion.div>

          {/* Start button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleStartGame}
              disabled={!canStart}
              size="lg"
              className="w-full bg-gradient-to-r from-red-500 via-primary to-secondary text-white font-bold text-lg py-6 disabled:opacity-40"
            >
              <Play className="w-5 h-5 mr-2" />
              Empezar partida
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ImpostorSetupPage;
