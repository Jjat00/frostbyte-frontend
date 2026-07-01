import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Users, Clock, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GameInstructionsPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const instructions = {
    'duelo-frostbyte': {
      name: 'Duelo Frostbyte',
      icon: '⚡',
      playPath: '/game/duelo-frostbyte/play',
      steps: [
        {
          icon: <Users className="w-6 h-6" />,
          title: 'Reúne a tus amigos',
          description: 'Crea una sala y comparte el código o el link con tus amigos para jugar juntos.',
        },
        {
          icon: <Clock className="w-6 h-6" />,
          title: 'Elige las rondas',
          description: 'Decide cuántas rondas quieres jugar: 1, 3 o 5 rondas.',
        },
        {
          icon: <Zap className="w-6 h-6" />,
          title: 'Reacciona rápido',
          description: 'Cuando aparezca la señal visual, toca tu pantalla lo más rápido posible.',
        },
        {
          icon: <Trophy className="w-6 h-6" />,
          title: 'Ve los resultados',
          description: 'Compite por el mejor tiempo promedio. El más rápido gana, pero lo importante es divertirse.',
        },
      ],
    },
    'impostor-frostbyte': {
      name: 'Impostor Frostbyte',
      icon: '🕵️',
      playPath: '/game/impostor-frostbyte/setup',
      steps: [
        {
          icon: <Users className="w-6 h-6" />,
          title: 'Agrega jugadores',
          description: 'Ingresa los nombres y elige un color para cada jugador. Mínimo 3 personas.',
        },
        {
          icon: <Zap className="w-6 h-6" />,
          title: 'Descubre tu rol',
          description: 'Pasa el celular a cada jugador para que vea su palabra secreta o descubra si es el impostor.',
        },
        {
          icon: <Clock className="w-6 h-6" />,
          title: 'Da pistas y debate',
          description: 'Por turnos, di una palabra relacionada. Luego debatan quién creen que es el impostor.',
        },
        {
          icon: <Trophy className="w-6 h-6" />,
          title: 'Vota y descubre',
          description: 'Vota para descubrir al impostor. Gana puntos si lo atrapas o si pasas desapercibido.',
        },
      ],
    },
  };

  const game = instructions[gameId];

  if (!game) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-light mb-4">Juego no encontrado</h2>
          <Button onClick={() => navigate('/game')}>Volver a juegos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 py-8">
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
          <div className="text-6xl mb-4">{game.icon}</div>
          <h1 className="text-4xl font-bold text-light tracking-wider mb-4">
            {game.name}
          </h1>
          <p className="text-xl text-gray/80">
            ¿Cómo se juega?
          </p>
        </motion.div>

        {/* Instructions */}
        <div className="space-y-6 mb-8">
          {game.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-secondary/80 backdrop-blur-xl border border-gray/20 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-light mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray/70">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Start Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => navigate(game.playPath || `/game/${gameId}/play`)}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-dark font-bold text-lg py-6 px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            ¡Empezar a jugar!
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default GameInstructionsPage;

