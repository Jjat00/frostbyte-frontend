import React from "react";
import { motion } from "framer-motion";
import { Crown, Cake, PartyPopper, Users, UtensilsCrossed, MessageCircle } from "lucide-react";

/**
 * Banner promocional de la Sala VIP (piso 3).
 *
 * Promociona la sala para cumpleaños, celebraciones y eventos de grupos
 * (~12 personas). Fase de expectativa: sin precios ni reserva en línea;
 * el interesado pide información al personal o por WhatsApp.
 */
const SalaVipBanner = () => {
  return (
    <section id="sala-vip" className="py-8 bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto relative overflow-hidden rounded-2xl border border-secondary/30 bg-linear-to-br from-secondary/15 via-dark-secondary to-violet-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          {/* Resplandor cian */}
          <div className="pointer-events-none absolute -top-12 -right-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Crown size={20} className="text-dark" />
              </div>
              <div>
                <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-secondary font-bold mb-1">
                  Nuevo · Piso 3
                </span>
                <h3 className="text-3xl font-black uppercase leading-none text-light">
                  Sala <span className="text-secondary">VIP</span>
                </h3>
              </div>
            </div>

            {/* Descripción */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <PartyPopper size={20} className="text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm leading-relaxed">
                Reserva nuestra sala privada del tercer piso para tu{" "}
                <span className="text-secondary font-bold">cumpleaños</span>,{" "}
                <span className="text-secondary font-bold">celebración</span> o el
                plan que quieras con tus amigos. Un espacio solo para ustedes.
              </p>
            </div>

            {/* Características */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-linear-to-b from-secondary/10 to-transparent border border-secondary/20 text-center">
                <Users size={18} className="text-secondary" />
                <span className="text-white/70 text-[11px] leading-tight font-semibold">
                  Grupos de ~12 personas
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-linear-to-b from-secondary/10 to-transparent border border-secondary/20 text-center">
                <Cake size={18} className="text-secondary" />
                <span className="text-white/70 text-[11px] leading-tight font-semibold">
                  Cumpleaños y eventos
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-linear-to-b from-secondary/10 to-transparent border border-secondary/20 text-center">
                <UtensilsCrossed size={18} className="text-secondary" />
                <span className="text-white/70 text-[11px] leading-tight font-semibold">
                  Con nuestra nueva comida
                </span>
              </div>
            </div>

            {/* CTA: pedir información */}
            <p className="text-center text-white/70 text-sm font-semibold mb-3">
              ¿Te interesa?{" "}
              <span className="text-secondary">Pregunta a nuestro personal</span> y
              te contamos todo.
            </p>

            <a
              href="https://wa.me/573164277879?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20Sala%20VIP%20del%20piso%203"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-linear-to-r from-primary to-secondary text-dark font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={18} />
              Pedir información por WhatsApp
            </a>

            <p className="text-center text-white/30 text-[10px] mt-3">
              Cupos por fecha limitados · Reserva con anticipación
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SalaVipBanner;
