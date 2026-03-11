import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Gamepad2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GamesListPage = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'duelo-frostbyte',
      name: 'Duelo Frostbyte',
      description: 'Juego de reflejos ultra rápido. Compite con tus amigos para ver quién reacciona más rápido.',
      icon: '⚡',
      minPlayers: 2,
      available: true,
    },
    {
      id: 'impostor-frostbyte',
      name: 'Impostor Frostbyte',
      description: 'Descubre al impostor entre tus amigos. Un celular, muchas sospechas.',
      icon: '🕵️',
      minPlayers: 3,
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-secondary via-dark to-dark-secondary p-4 relative overflow-hidden">
      {/* Background effects - Colores diferentes para hacerlo más llamativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
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
            onClick={() => navigate(-1)}
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
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-amber-400 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              Frostbyte Play
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </motion.div>
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
              className={`bg-dark/90 backdrop-blur-xl border-2 rounded-2xl p-6 shadow-2xl transition-all hover:scale-105 relative overflow-hidden ${
                game.available
                  ? 'border-violet-500/50 hover:border-violet-400 cursor-pointer shadow-violet-500/20'
                  : 'border-gray/20 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => game.available && navigate(`/game/${game.id}/instrucciones`)}
            >
              {/* Efecto de brillo animado en el borde */}
              {game.available && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-amber-500/0 opacity-50 animate-pulse"></div>
              )}
              
              <div className="relative z-10">
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500 mb-4 mx-auto shadow-lg shadow-violet-500/50"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Gamepad2 className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent mb-2 text-center">
                  {game.name}
                </h3>
                <p className="text-gray/70 text-center mb-4">
                  {game.description}
                </p>
                {game.minPlayers && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-violet-300 font-medium">
                        Mínimo {game.minPlayers} jugadores
                      </span>
                    </div>
                  </div>
                )}
                {game.available ? (
                  <Button
                    className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500 text-white font-bold hover:shadow-2xl hover:shadow-violet-500/50 transition-all"
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
              </div>
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

