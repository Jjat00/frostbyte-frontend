import React from "react";
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
 *
 * El verde esmeralda que llevaba se retiró el 2026-08-20: en el lenguaje del
 * hero los domicilios son cyan, y un tercer color de servicio solo diluía lo
 * que el color significa.
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

  // Cyan de marca para todo el bloque: es el color de los domicilios.
  const accent = { "--fb-accent": "var(--color-secondary)" };

  if (variant === "strip") {
    return (
      <section className="fb-section fb-section--plain py-7">
        <div className="container relative z-10 mx-auto px-5">
          <div
            style={accent}
            className="fb-reveal fb-card mx-auto flex max-w-xl flex-col items-center gap-3 p-4 sm:flex-row sm:justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Bike size={17} className="flex-shrink-0 text-secondary" />
              <p className="text-[0.78rem] text-light/70">
                ¿Antojado? Pide tu domicilio{" "}
                <span className="text-light">aquí en la app</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/domicilios" className="fb-btn fb-btn--accent px-3.5 py-2 text-[0.7rem]">
                <Bike size={13} />
                Pedir en la app
              </Link>
              {isCustomerAuthenticated && (
                <Link to="/mis-pedidos" className="fb-btn px-3.5 py-2 text-[0.7rem]">
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
                  className="fb-btn px-3.5 py-2 text-[0.7rem]"
                >
                  <MessageCircle size={13} />
                  {line.display}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="domicilios" style={accent} className="fb-section py-9">
      <div className="container relative z-10 mx-auto px-5">
        <div className="fb-reveal fb-card fb-card--accent mx-auto max-w-xl p-5 sm:p-6">
          {/* Encabezado */}
          <div className="mb-5 flex items-center gap-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] border border-secondary/20 bg-secondary/10">
              <Bike size={19} className="text-secondary" />
            </span>
            <div className="min-w-0">
              <span className="fb-eyebrow fb-eyebrow--accent block">
                Nuevo servicio
              </span>
              <h3 className="font-display m-0 mt-1.5 text-lg font-semibold uppercase leading-none tracking-[0.14em] text-light">
                Domicilios
              </h3>
            </div>
          </div>

          {/* Qué es */}
          <div className="fb-inset mb-4 flex items-start gap-3 p-3.5">
            <MapPin size={17} className="mt-0.5 flex-shrink-0 text-secondary" />
            <p className="text-[0.78rem] leading-relaxed text-light/65">
              Pide tu domicilio{" "}
              <span className="text-light">directo en la app</span>: escoge tus
              productos con fotos y precios, marca tu ubicación en el mapa y
              sigue tu pedido en vivo hasta tu puerta.
            </p>
          </div>

          {/* El login no se pide aquí sino en /domicilios, que es un muro:
              una sola puerta para pedir, no tres copys sueltos. */}
          {isCustomerAuthenticated && (
            <p className="mb-3 text-center text-[0.75rem] text-light/60">
              {firstName ? `Listo, ${firstName}.` : "Listo."} Tu cuenta está
              conectada, solo falta escoger.
            </p>
          )}

          <div className="space-y-2">
            <Link to="/domicilios" className="fb-btn fb-btn--accent w-full">
              <Bike size={16} />
              {/* Sin sesión el siguiente paso es entrar: decirlo evita que el
                  muro se sienta una puerta en la cara */}
              {isCustomerAuthenticated
                ? "Pedir a domicilio"
                : "Entrar y pedir a domicilio"}
            </Link>
            {isCustomerAuthenticated && (
              <Link to="/mis-pedidos" className="fb-btn w-full">
                <ClipboardList size={16} />
                Ver el estado de mi pedido
              </Link>
            )}
          </div>

          {/* WhatsApp sigue siendo un canal de pedidos de primera, no letra pequeña */}
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="fb-eyebrow mb-2.5 text-center">
              ¿Prefieres pedir por WhatsApp?
            </p>
            <div className="grid gap-2">
              {WHATSAPP_LINES.map((line) => (
                <a
                  key={line.number}
                  href={waLink(line.number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fb-btn w-full"
                >
                  <MessageCircle size={15} />
                  {line.display}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DomiciliosBanner;
