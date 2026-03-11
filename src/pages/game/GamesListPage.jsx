import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Gamepad2, Users, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GAME_ICONS = {
  'duelo-frostbyte': Zap,
  'impostor-frostbyte': Search,
};

const GamesListPage = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'duelo-frostbyte',
      name: 'Duelo Frostbyte',
      description: 'Compite con tus amigos en un duelo de reflejos ultra rapido.',
      minPlayers: 2,
      accent: 'amber',
      available: true,
    },
    {
      id: 'impostor-frostbyte',
      name: 'Impostor Frostbyte',
      description: 'Descubre al impostor entre tus amigos. Un celular, muchas sospechas.',
      minPlayers: 3,
      accent: 'red',
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-secondary via-dark to-dark-secondary p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
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
          className="text-center mb-10"
        >
          <Gamepad2 className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-light tracking-wider mb-2">
            Frostbyte Play
          </h1>
          <p className="text-gray/60">
            Juega mientras esperas tu pedido
          </p>
        </motion.div>

        {/* Games */}
        <div className="space-y-4">
          {games.map((game, index) => {
            const Icon = GAME_ICONS[game.id] || Gamepad2;

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => game.available && navigate(`/game/${game.id}/instrucciones`)}
                className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden transition-all ${
                  game.available
                    ? 'bg-white/5 border-white/10 hover:border-white/20 cursor-pointer active:scale-[0.98]'
                    : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-secondary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-light mb-0.5">
                      {game.name}
                    </h3>
                    <p className="text-sm text-gray/50 leading-snug">
                      {game.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Users className="w-3.5 h-3.5 text-gray/40" />
                      <span className="text-xs text-gray/40">
                        {game.minPlayers}+ jugadores
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {game.available ? (
                      <div className="w-10 h-10 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-secondary ml-0.5" />
                      </div>
                    ) : (
                      <span className="text-xs text-gray/40">Pronto</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray/30 text-xs mt-8"
        >
          Mas juegos proximamente
        </motion.p>
      </div>
    </div>
  );
};

export default GamesListPage;
