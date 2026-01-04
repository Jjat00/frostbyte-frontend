import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GamesListPage = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'duelo-frostbyte',
      name: 'Duelo Frostbyte',
      description: 'Juego de reflejos ultra rápido. Compite con tus amigos para ver quién reacciona más rápido.',
      icon: '⚡',
      available: true,
    },
    // Futuros juegos se agregarán aquí
  ];

  return (
    <div className="min-h-screen bg-dark p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/#frostbyte-play')}
            className="text-gray hover:text-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al menú
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center gap-3 mb-6"
          >
            <Sparkles className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-light tracking-wider">
              Frostbyte Play
            </h1>
            <Sparkles className="w-12 h-12 text-secondary" />
          </motion.div>
          <p className="text-xl text-gray/80 max-w-2xl mx-auto">
            ¡Diviértete jugando mientras esperas tu pedido!
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-dark-secondary/80 backdrop-blur-xl border rounded-2xl p-6 shadow-2xl transition-all hover:scale-105 ${
                game.available
                  ? 'border-primary/50 hover:border-primary cursor-pointer'
                  : 'border-gray/20 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => game.available && navigate(`/game/${game.id}/instrucciones`)}
            >
              <div className="text-5xl mb-4 text-center">{game.icon}</div>
              <h3 className="text-2xl font-bold text-light mb-2 text-center">
                {game.name}
              </h3>
              <p className="text-gray/70 text-center mb-6">
                {game.description}
              </p>
              {game.available ? (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/game/${game.id}/instrucciones`);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Jugar
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full"
                  variant="outline"
                >
                  Próximamente
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-gray/60 text-sm">
            🎮 Pronto habrá más juegos disponibles
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default GamesListPage;

