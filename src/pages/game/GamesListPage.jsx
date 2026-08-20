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
    <div className="fb-screen min-h-screen p-4">

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
          <h1 className="font-display text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-light">
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
                className={`fb-card overflow-hidden transition-all ${
                  game.available
                    ? 'fb-card--link cursor-pointer active:scale-[0.98]'
                    : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[13px] border border-white/[0.1] bg-white/[0.03]">
                    <Icon className="h-5 w-5 text-light/70" strokeWidth={1.6} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-[0.88rem] font-semibold uppercase tracking-[0.12em] text-light">
                      {game.name}
                    </h3>
                    <p className="mt-2 text-[0.75rem] leading-relaxed text-light/50">
                      {game.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Users className="h-3 w-3 text-light/30" />
                      <span className="text-[0.68rem] text-light/40">
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
                      <span className="text-[0.68rem] text-light/40">Pronto</span>
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
