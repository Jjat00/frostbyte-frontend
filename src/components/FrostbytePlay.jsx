import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Gamepad2, Zap, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const games = [
  {
    id: "duelo-frostbyte",
    name: "Duelo Frostbyte",
    description:
      "Juego de reflejos ultra rapido. Compite con tus amigos para ver quien reacciona mas rapido.",
    icon: Zap,
    minPlayers: 2,
    accent: "violet",
    gradient: "from-violet-500 via-purple-500 to-amber-500",
    border: "border-violet-500/40",
    shadow: "shadow-violet-500/20",
    features: ["Juego de reflejos", "Rondas rapidas"],
  },
  {
    id: "impostor-frostbyte",
    name: "Impostor Frostbyte",
    description:
      "Descubre al impostor entre tus amigos. Un celular, muchas sospechas. Encuentra quien no pertenece.",
    icon: Search,
    minPlayers: 3,
    accent: "red",
    gradient: "from-red-500 via-rose-500 to-orange-500",
    border: "border-red-500/40",
    shadow: "shadow-red-500/20",
    features: ["Juego de deduccion", "Conversacion en grupo"],
  },
];

const GameCard = ({ game, index }) => {
  const navigate = useNavigate();
  const Icon = game.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex-1 min-w-0"
    >
      <div
        className={`bg-dark/90 backdrop-blur-xl border-2 ${game.border} rounded-2xl p-6 md:p-8 ${game.shadow} shadow-xl relative overflow-hidden h-full flex flex-col`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-50 animate-pulse" />

        <div className="relative z-10 flex flex-col h-full">
          <motion.div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${game.gradient} mb-5 shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          <h3
            className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent mb-3`}
          >
            {game.name}
          </h3>

          <p className="text-gray/70 text-sm mb-4 leading-relaxed">
            {game.description}
          </p>

          <ul className="text-gray/60 space-y-1.5 mb-6 text-sm">
            {game.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-white/30">-</span>
                <span>{f}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-white/30" />
              <span>{game.minPlayers}+ jugadores</span>
            </li>
          </ul>

          <div className="mt-auto">
            <Button
              onClick={() => navigate(`/game/${game.id}/instrucciones`)}
              size="sm"
              className={`bg-gradient-to-r ${game.gradient} text-white font-bold hover:shadow-lg transition-all hover:scale-105 w-full`}
            >
              <Play className="w-4 h-4 mr-1.5" />
              Jugar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FrostbytePlay = () => {
  return (
    <section
      id="frostbyte-play"
      className="py-20 bg-gradient-to-br from-dark-secondary via-dark to-dark-secondary relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-amber-400 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              Frostbyte Play
            </h2>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </motion.div>
          </div>
          <p className="text-xl text-gray/80 max-w-3xl mx-auto mb-2">
            Diviertete jugando mientras esperas tu pedido
          </p>
          <p className="text-gray/60 max-w-2xl mx-auto">
            Juegos rapidos y divertidos para compartir con tus amigos en la mesa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FrostbytePlay;
