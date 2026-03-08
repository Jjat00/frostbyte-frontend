import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, Zap, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FrostbytePlay = () => {
  const navigate = useNavigate();

  return (
    <section
      id="frostbyte-play"
      className="py-20 bg-gradient-to-br from-dark-secondary via-dark to-dark-secondary relative overflow-hidden"
    >
      {/* Background effects - Colores diferentes para hacerlo más llamativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
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
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_20px_rgba(244,114,182,0.4)]">
              Frostbyte Play
            </h2>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
            </motion.div>
          </div>
          <p className="text-xl text-gray/80 max-w-3xl mx-auto mb-2">
            ¡Diviértete jugando mientras esperas tu pedido!
          </p>
          <p className="text-gray/60 max-w-2xl mx-auto">
            Juegos rápidos y divertidos para compartir con tus amigos en la mesa
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-dark/90 backdrop-blur-xl border-2 border-rose-500/50 rounded-2xl p-8 md:p-12 shadow-2xl shadow-rose-500/20 relative overflow-hidden">
            {/* Efecto de brillo animado en el borde */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-pink-500/0 opacity-50 animate-pulse"></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              {/* Icon and Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-400 mb-6 shadow-lg shadow-rose-500/50"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Gamepad2 className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  Duelo Frostbyte
                </h3>
                <p className="text-gray/70 mb-4">
                  Juego de reflejos ultra rápido. Compite con tus amigos para
                  ver quién reacciona más rápido. Selecciona tu mesa y comparte
                  el link con tus amigos.
                </p>
                <ul className="text-gray/60 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-rose-400 text-lg">⚡</span>
                    <span>Juego de reflejos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-400 text-lg">👥</span>
                    <span>Para múltiples jugadores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-rose-300 text-lg">⏱️</span>
                    <span>Rondas rápidas</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => navigate("/game")}
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-rose-500/50 transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver Juegos
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FrostbytePlay;
