import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-linear-to-b from-dark via-dark-secondary to-dark"></div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full filter blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="px-4 py-2 bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-primary text-sm font-semibold tracking-wider">
                REFRESCO HELADO PREMIUM
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-black text-light leading-tight"
            >
              ENTRA EN LA
              <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                DIMENSIÓN FROSTBYTE
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray text-lg md:text-xl leading-relaxed"
            >
              Experimenta bebidas heladas como nunca antes. Nuestros granizados
              y frappés combinan sabores innovadores con la frescura más intensa
              que puedas imaginar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={() =>
                  document
                    .getElementById("granizados")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
              >
                Explorar Menú
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-2 border-secondary text-secondary font-bold text-lg px-8 py-6 hover:bg-secondary/10 transition-all duration-300"
              >
                Saber Más
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-secondary/30 rounded-full filter blur-3xl animate-pulse"></div>
              <img
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                alt="Bebida congelada FrostByte"
                src="https://images.unsplash.com/photo-1586344497254-1c04ab49d618"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="text-primary" size={40} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
