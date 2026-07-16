import React from "react";
import { motion } from "framer-motion";
import { Cake, PartyPopper, CreditCard, Users } from "lucide-react";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

const BirthdayDiscountBanner = () => {
  return (
    <section
      id="descuento-cumple"
      className="py-8 bg-dark relative overflow-hidden"
    >
      {/* Sistema 26: capa decorativa tipo afiche (sutil, ligera en GPU) */}
      <Mundial26Backdrop />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto relative overflow-hidden rounded-2xl border border-gold/30 bg-linear-to-br from-gold/10 via-dark-secondary to-grass/10"
        >
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-gold to-grass flex items-center justify-center flex-shrink-0">
                <Cake size={20} className="text-dark" />
              </div>
              <div>
                <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-gold font-bold mb-1">
                  Cumpleaneros
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gold">
                    50% OFF
                  </span>
                </div>
                <p className="text-white/80 text-sm font-semibold -mt-0.5">
                  para cumpleañeros
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <PartyPopper size={20} className="text-gold flex-shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm leading-relaxed">
                Si hoy es tu cumpleaños, obtienes <span className="text-gold font-bold">50% de descuento</span> en el producto que elijas. Aplica para <span className="text-gold font-bold">un solo producto</span> de cualquier categoría.
              </p>
            </div>

            {/* Requisitos */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-gold/10 to-grass/10 border border-gold/20">
                <CreditCard size={20} className="text-grass flex-shrink-0" />
                <p className="text-white/70 text-sm">
                  Muestra tu <span className="text-grass font-bold">documento de identidad</span> al mesero para verificar tu fecha de nacimiento.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-gold/10 to-grass/10 border border-gold/20">
                <Users size={20} className="text-grass flex-shrink-0" />
                <p className="text-white/70 text-sm">
                  Válido si vienes con mínimo <span className="text-grass font-bold">2 amigos</span>.
                </p>
              </div>
            </div>

            {/* Urgencia */}
            <p className="text-center text-gold/80 text-xs font-semibold mb-3">
              Válido únicamente el día de tu cumpleaños
            </p>

            {/* CTA */}
            <p className="text-center text-white/50 text-xs">
              Pregúntale al mesero para reclamar tu descuento
            </p>

            {/* No acumulable */}
            <p className="text-center text-white/30 text-[10px] mt-3">
              No acumulable con otras promociones. No incluye la jarra de
              mojito ni botellas de vino.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BirthdayDiscountBanner;
