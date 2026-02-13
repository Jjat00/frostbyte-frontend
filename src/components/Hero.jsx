import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Instagram,
  MapPin,
  Snowflake,
  Coffee,
  Wine,
  GlassWater,
  Beer,
  Sparkles,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

// Icono de TikTok personalizado
const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/frostbyte.col/",
    label: "Instagram",
  },
  {
    icon: TikTokIcon,
    href: "https://www.tiktok.com/@frostbyte.col",
    label: "TikTok",
  },
];

const ProductFloatCard = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  href,
  delay = 0,
}) => (
  <motion.button
    type="button"
    onClick={() =>
      document.getElementById(href)?.scrollIntoView({ behavior: "smooth" })
    }
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4 }}
    className="group w-full text-left bg-dark border border-gray/20 rounded-2xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="text-dark" size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-light font-bold text-sm">{title}</div>
        <div className="text-gray text-xs">{subtitle}</div>
      </div>
    </div>
  </motion.button>
);

const Hero = () => {
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true);

  useEffect(() => {
    const fetchMotivationalPhrase = async () => {
      try {
        const response = await fetch(
          `${env.API_BASE_URL}/motivational/phrase/`
        );
        const data = await response.json();

        if (response.ok && data.phrase) {
          setMotivationalPhrase(data.phrase);
        }
      } catch (error) {
        console.error("Error al obtener la frase motivacional:", error);
      } finally {
        setIsLoadingPhrase(false);
      }
    };

    fetchMotivationalPhrase();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-linear-to-b from-dark via-dark-secondary to-dark"></div>

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-rose-400 rounded-full filter blur-[120px] animate-pulse"
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
              <span className="px-4 py-2 bg-linear-to-r from-primary/20 to-secondary/20 border border-primary/50 rounded-full text-primary text-sm font-semibold tracking-wider inline-flex items-center gap-2">
                <Heart size={14} fill="currentColor" />
                EDICION AMOR Y AMISTAD
                <Heart size={14} fill="currentColor" />
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-black text-light leading-tight"
            >
              CELEBRA CON
              <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                AMOR Y AMISTAD
              </span>
            </motion.h1>

            {!isLoadingPhrase && motivationalPhrase && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="relative"
              >
                <div className="px-6 py-3 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/30 rounded-2xl backdrop-blur-sm">
                  <p className="text-primary text-base md:text-lg font-semibold text-center italic">
                    "{motivationalPhrase}"
                  </p>
                </div>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray text-lg md:text-xl leading-relaxed"
            >
              Brinda por quienes mas quieres con nuestras bebidas heladas
              especiales. Granizados, frappes y cocteles para compartir en
              este dia tan especial.
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
                    .getElementById("menu")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-linear-to-r from-primary to-secondary text-dark font-bold text-lg px-8 py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
              >
                Explorar Carta
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-primary/50 text-primary font-bold text-lg px-8 py-6 hover:bg-primary/10 hover:border-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <a
                  href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={20} className="mr-2" />
                  Ubicación en Cumbal
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 pt-4"
            >
              <span className="text-gray text-sm">Síguenos:</span>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/40 rounded-full text-primary hover:from-primary hover:to-secondary hover:text-dark hover:border-transparent hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300"
                  >
                    <social.icon size={20} />
                    <span className="text-sm font-semibold">
                      {social.label}
                    </span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative w-full flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="grid grid-cols-2 gap-3">
                  {/* Especial Amor y Amistad */}
                  <motion.button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("desguayabator")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ y: -4 }}
                    className="col-span-2 group w-full text-left bg-dark border border-pink-500/40 rounded-2xl p-4 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-pink-400 to-rose-500 group-hover:scale-110 transition-transform duration-300">
                        <Heart className="text-dark" size={20} fill="currentColor" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-pink-400 font-bold text-sm">
                          Especial Amor y Amistad
                        </div>
                        <div className="text-gray text-xs">Celebra con Frostbyte</div>
                      </div>
                    </div>
                  </motion.button>

                  <ProductFloatCard
                    title="Granizados"
                    subtitle="Hielo frutal"
                    icon={Snowflake}
                    gradient="from-cyan-400 to-blue-500"
                    href="granizados"
                    delay={0.3}
                  />
                  <ProductFloatCard
                    title="Frappés"
                    subtitle="Café helado"
                    icon={Coffee}
                    gradient="from-amber-600 to-orange-600"
                    href="frappes"
                    delay={0.4}
                  />
                  <ProductFloatCard
                    title="Sodas"
                    subtitle="Italianas"
                    icon={Sparkles}
                    gradient="from-pink-400 to-red-500"
                    href="sodas"
                    delay={0.5}
                  />
                  <ProductFloatCard
                    title="Micheladas"
                    subtitle="Cerveza"
                    icon={Beer}
                    gradient="from-orange-400 to-red-500"
                    href="micheladas"
                    delay={0.6}
                  />
                  <ProductFloatCard
                    title="Cócteles"
                    subtitle="Clásicos"
                    icon={Wine}
                    gradient="from-purple-400 to-pink-500"
                    href="mocktails"
                    delay={0.7}
                  />
                  <ProductFloatCard
                    title="Shots"
                    subtitle="Licores premium"
                    icon={GlassWater}
                    gradient="from-emerald-400 to-teal-500"
                    href="shots"
                    delay={0.8}
                  />
                </div>
              </div>
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
