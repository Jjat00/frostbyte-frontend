import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bike, MessageCircle, MapPin, ClipboardList } from "lucide-react";
import { useStoreConfig } from "@/hooks";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { WHATSAPP_LINES, waLink } from "@/lib/domicilios";

/**
 * Banner de domicilios.
 *
 * Manda `StoreSettings.customer_ordering_enabled`: **apagado no se pinta nada**
 * (decisión de Jaime del 2026-08-20 — con el servicio en pausa no se nombra en
 * ninguna parte de la carta, ni como anuncio ni como línea de WhatsApp).
 * Encendido invita a pedir DENTRO de la app, con o sin sesión: el login con
 * Google salta una sola vez, al confirmar el pedido. Con sesión suma el acceso
 * al estado del pedido (/mis-pedidos). WhatsApp queda de respaldo.
 *
 * Variantes (mismo patrón que el banner de la Polla Mundialista para repetir sin saturar):
 * - "feature": tarjeta completa, encabeza la carta (lleva el id #domicilios)
 * - "strip": barra compacta de recordatorio al cierre de la carta
 */
const DomiciliosBanner = ({ variant = "feature" }) => {
  const { data: storeConfig } = useStoreConfig();
  const inAppOrdering = !!storeConfig?.customer_ordering_enabled;
  const isCustomerAuthenticated = useCustomerAuthStore(
    (s) => s.isAuthenticated
  );
  const customer = useCustomerAuthStore((s) => s.customer);

  const firstName =
    customer?.first_name || customer?.full_name?.split(" ")[0] || "";

  // Servicio en pausa: el banner no existe, en ninguna de sus variantes.
  if (!inAppOrdering) return null;

  if (variant === "strip") {
    return (
      <section className="py-6 bg-dark relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-xl mx-auto flex flex-col items-center gap-3 rounded-xl border border-emerald-400/25 bg-linear-to-r from-emerald-500/10 via-dark-secondary to-emerald-500/10 p-4 sm:flex-row sm:justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Bike size={20} className="text-emerald-400 flex-shrink-0" />
              <p className="text-white/75 text-sm font-semibold">
                ¿Antojado? Pide tu domicilio{" "}
                <span className="text-emerald-300">aquí en la app</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/domicilios"
                className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 text-dark px-3.5 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Bike size={13} />
                Pedir en la app
              </Link>
              {isCustomerAuthenticated && (
                <Link
                  to="/mis-pedidos"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                >
                  <ClipboardList size={13} />
                  Estado de mi pedido
                </Link>
              )}
              {WHATSAPP_LINES.map((line) => (
                <a
                  key={line.number}
                  href={waLink(line.number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                >
                  <MessageCircle size={13} />
                  {line.display}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="domicilios" className="py-8 bg-dark relative overflow-hidden">
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

            {/* Descripción del pedido en la app */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <MapPin
                size={20}
                className="text-emerald-300 flex-shrink-0 mt-0.5"
              />
              <p className="text-white/70 text-sm leading-relaxed">
                ¡Pide tu domicilio{" "}
                <span className="text-emerald-300 font-bold">
                  directo en la app
                </span>
                ! Escoge tus productos con fotos y precios, marca tu ubicación
                en el mapa y sigue tu pedido en vivo hasta tu puerta.
              </p>
            </div>

            {/* El login no se pide aquí sino en /domicilios, que es un
                  muro: una sola puerta para pedir, no tres copys sueltos. */}
            {isCustomerAuthenticated && (
              <p className="text-center text-emerald-300/90 text-sm font-semibold mb-3">
                {firstName ? `¡Listo, ${firstName}!` : "¡Listo!"} Tu cuenta está
                conectada, solo falta escoger.
              </p>
            )}
            <div className="space-y-2">
              <Link
                to="/domicilios"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-linear-to-r from-emerald-400 to-emerald-600 text-dark font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              >
                <Bike size={18} />
                {/* Sin sesión el siguiente paso es entrar: decirlo evita
                      que el muro se sienta una puerta en la cara */}
                {isCustomerAuthenticated
                  ? "Pedir a domicilio"
                  : "Entrar y pedir a domicilio"}
              </Link>
              {isCustomerAuthenticated && (
                <Link
                  to="/mis-pedidos"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-emerald-400/30 text-emerald-300 font-bold text-sm uppercase tracking-wide hover:bg-emerald-500/10 transition-colors"
                >
                  <ClipboardList size={18} />
                  Ver el estado de mi pedido
                </Link>
              )}
            </div>

            {/* WhatsApp sigue siendo un canal de pedidos de primera, no letra pequeña */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-center text-white/60 text-xs font-bold uppercase tracking-wider mb-2.5">
                ¿Prefieres pedir por WhatsApp?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {WHATSAPP_LINES.map((line) => (
                  <a
                    key={line.number}
                    href={waLink(line.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-bold text-sm hover:bg-emerald-500/25 active:scale-[0.98] transition-all"
                  >
                    <MessageCircle size={17} className="flex-shrink-0" />
                    {line.display}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DomiciliosBanner;
