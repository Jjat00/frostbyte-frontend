import React from "react";
import { motion } from "framer-motion";
import { Bike, MessageCircle, Clock } from "lucide-react";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";

// Números de WhatsApp que reciben pedidos a domicilio
const WHATSAPP_LINES = [
  { display: "320 528 8348", number: "573205288348" },
  { display: "311 781 4338", number: "573117814338" },
];

const WA_TEXT = encodeURIComponent(
  "Hola, quiero hacer un pedido a domicilio"
);

/**
 * Banner de domicilios.
 *
 * Anuncia que Frostbyte ahora hace domicilios y muestra las dos líneas de
 * WhatsApp que reciben pedidos, cada una como botón directo a wa.me con
 * mensaje prellenado. Mobile-first, mismo lenguaje visual de la carta.
 */
const DomiciliosBanner = () => {
  return (
    <section id="domicilios" className="py-8 bg-dark relative overflow-hidden">
      {/* Sistema 26: capa decorativa tipo afiche (sutil, ligera en GPU) */}
      <Mundial26Backdrop />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-linear-to-br from-emerald-500/15 via-dark-secondary to-secondary/10 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          {/* Resplandor verde */}
          <div className="pointer-events-none absolute -top-12 -right-8 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Bike size={20} className="text-dark" />
              </div>
              <div>
                <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-emerald-300 font-bold mb-1">
                  Nuevo servicio
                </span>
                <h3 className="text-3xl font-black uppercase leading-none text-light">
                  Domi<span className="text-emerald-400">cilios</span>
                </h3>
              </div>
            </div>

            {/* Descripción */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <Clock size={20} className="text-emerald-300 flex-shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm leading-relaxed">
                ¡Ahora llevamos Frostbyte hasta tu casa! Escoge de la carta lo
                que se te antoje y{" "}
                <span className="text-emerald-300 font-bold">
                  ordena por WhatsApp
                </span>{" "}
                a cualquiera de nuestras líneas.
              </p>
            </div>

            {/* Líneas de WhatsApp */}
            <div className="space-y-2">
              {WHATSAPP_LINES.map((line) => (
                <a
                  key={line.number}
                  href={`https://wa.me/${line.number}?text=${WA_TEXT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-linear-to-r from-emerald-400 to-emerald-600 text-dark font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={18} />
                  Pedir al {line.display}
                </a>
              ))}
            </div>

            <p className="text-center text-white/30 text-[10px] mt-3">
              Toca el número para abrir el chat y hacer tu pedido
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DomiciliosBanner;
