import React from "react";
import { motion } from "framer-motion";
import { Instagram, Tag, ArrowRight } from "lucide-react";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const STEPS = [
  { num: 1, text: "Síguenos en Instagram o TikTok" },
  { num: 2, text: "Sube una foto y etiquétanos" },
  { num: 3, text: "Muéstrale la publicación al mesero" },
];

const SocialDiscountBanner = () => {
  return (
    <section id="descuento-redes" className="py-8 bg-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto relative overflow-hidden rounded-2xl border border-gold/30 bg-linear-to-br from-grass/15 via-dark-secondary to-gold/10"
        >
          {/* Capa decorativa afiche Mundial 26 */}
          <Mundial26Backdrop />

          <div className="relative p-6">
            {/* Header con icono + porcentaje */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-gold to-grass flex items-center justify-center flex-shrink-0 shadow-lg shadow-grass/30">
                <Tag size={20} className="text-dark" />
              </div>
              <div>
                <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-1">
                  Promo Mundial
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black bg-linear-to-r from-gold to-grass bg-clip-text text-transparent">
                    10% OFF
                  </span>
                </div>
                <p className="text-white/80 text-sm font-semibold -mt-0.5">
                  en tu pedido de hoy
                </p>
              </div>
            </div>

            {/* Pasos numerados */}
            <div className="space-y-2 mb-5">
              {STEPS.map((step) => (
                <div key={step.num} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
                    {step.num}
                  </span>
                  <span className="text-white/70 text-sm">{step.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs con verbo de acción */}
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/frostbyte.col/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-grass border border-grass text-dark text-sm font-bold hover:brightness-110 transition-all duration-200"
              >
                <Instagram size={16} />
                Seguir en Instagram
              </a>
              <a
                href="https://www.tiktok.com/@frostbyte.col"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold border border-gold text-dark text-sm font-bold hover:brightness-110 transition-all duration-200"
              >
                <TikTokIcon size={16} />
                Seguir en TikTok
              </a>
            </div>

            {/* Urgencia */}
            <p className="text-center text-white/40 text-xs mt-4 flex items-center justify-center gap-1.5">
              <ArrowRight size={12} className="text-gold" />
              Válido para tu pedido de hoy
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialDiscountBanner;
