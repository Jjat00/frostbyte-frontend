import React from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const SocialDiscountBanner = () => {
  return (
    <section className="py-6 bg-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto border border-white/10 rounded-2xl p-5"
        >
          {/* Título + porcentaje */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              10% OFF
            </span>
            <span className="text-white font-semibold text-sm">en tu pedido</span>
          </div>

          {/* Instrucción */}
          <p className="text-white/50 text-sm mb-4">
            Síguenos y sube una foto etiquetándonos. Muéstrale la publicación al mesero.
          </p>

          {/* Links */}
          <div className="flex gap-2">
            <a
              href="https://www.instagram.com/frostbyte.col/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white/60 text-sm font-medium hover:border-white/30 hover:text-white transition-colors duration-200"
            >
              <Instagram size={14} />
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@frostbyte.col"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white/60 text-sm font-medium hover:border-white/30 hover:text-white transition-colors duration-200"
            >
              <TikTokIcon size={14} />
              TikTok
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialDiscountBanner;
