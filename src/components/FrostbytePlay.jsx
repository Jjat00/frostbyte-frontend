import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const FrostbytePlay = () => {
  const navigate = useNavigate();

  return (
    <section
      id="frostbyte-play"
      className="py-20 bg-dark-secondary relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-light tracking-wider">
              Frostbyte Play
            </h2>
            <Sparkles className="w-10 h-10 text-secondary" />
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
          <div className="bg-dark/80 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-primary/10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Icon and Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
                  <Zap className="w-10 h-10 text-dark" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-light mb-4">
                  Duelo Frostbyte
                </h3>
                <p className="text-gray/70 mb-4">
                  Juego de reflejos ultra rápido. Compite con tus amigos para
                  ver quién reacciona más rápido. Escanea el QR de tu mesa y
                  comparte el link con tus amigos.
                </p>
                <ul className="text-gray/60 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">⚡</span>
                    Juego de reflejos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">👥</span>
                    Para múltiples jugadores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">⏱️</span>
                    Rondas rápidas
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => navigate("/game")}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-lg hover:shadow-primary/50 transition-all"
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

