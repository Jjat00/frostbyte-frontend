import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bike,
  ClipboardList,
  Lock,
  MessageCircle,
  UserCircle2,
  UtensilsCrossed,
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useCartaPath } from "@/hooks";
import { WHATSAPP_LINES, waLink } from "@/lib/domicilios";

/**
 * Muro de /domicilios: sin sesión de cliente no se entra a la tienda.
 *
 * Decisión de Jaime (2026-08-05): pedir a domicilio exige cuenta desde el
 * primer paso, no al confirmar. La vitrina no se pierde — la carta pública en
 * `/` sigue mostrando todos los productos y precios sin sesión —, así que
 * aquí el muro solo protege el acto de pedir.
 *
 * Solo se muestra con los pedidos en la app encendidos: apagados, /domicilios
 * no existe y devuelve a la carta.
 *
 * El muro no es una puerta en la cara: junto al botón de Google ofrece pedir
 * por WhatsApp, que sigue siendo un canal de pedidos de primera y no exige
 * cuenta.
 */
const DeliveryLoginWall = ({ storeClosed, onError }) => {
  const [error, setError] = useState("");
  const { cartaPath } = useCartaPath();

  const handleError = (message) => {
    setError(message);
    onError?.(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-sm py-8 text-center"
    >
      <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[16px] border border-secondary/20 bg-secondary/10">
        <Bike className="h-6 w-6 text-secondary" />
      </span>

      <span className="fb-eyebrow block">Domicilios</span>
      <h2 className="font-display m-0 mt-2.5 text-[1.15rem] font-semibold uppercase leading-tight tracking-[0.14em] text-light">
        Entra para pedir
      </h2>
      <span aria-hidden className="fb-rule mx-auto mt-4" />
      <p className="mt-4 text-[0.8rem] leading-relaxed text-light/50">
        Los domicilios van con tu cuenta de Google. Es un toque y no vuelves a
        escribir tus datos.
      </p>

      <ul className="my-6 grid gap-2.5 text-left text-[0.78rem] text-light/60">
        {[
          [Bike, "Te lo llevamos hasta tu puerta"],
          [ClipboardList, "Sigues tu pedido en vivo y queda en tu historial"],
          [UserCircle2, "Tu nombre y teléfono, listos en cada pedido"],
        ].map(([Icon, text]) => (
          <li key={text} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
            {text}
          </li>
        ))}
      </ul>

      {storeClosed && (
        <div className="fb-inset mb-4 flex items-start gap-2.5 p-3 text-left">
          <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[0.72rem] leading-relaxed text-light/55">
            Ahora mismo estamos cerrados: puedes entrar y dejar tu cuenta
            lista, pero no recibimos pedidos hasta que el badge diga Abierto.
          </p>
        </div>
      )}

      <GoogleSignInButton onError={handleError} />
      {error && <p className="mt-3 text-[0.78rem] text-red-300">{error}</p>}

      {/* Sin cuenta también se pide: la línea de WhatsApp recibe igual */}
      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <p className="fb-eyebrow mb-2.5">
          ¿Prefieres pedir por WhatsApp?
        </p>
        <div className="grid grid-cols-1 gap-2">
          {WHATSAPP_LINES.map((line) => (
            <a
              key={line.number}
              href={waLink(line.number)}
              target="_blank"
              rel="noopener noreferrer"
              className="fb-btn w-full"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              {line.display}
            </a>
          ))}
        </div>
      </div>

      {/* Salida para quien solo quería mirar: la carta no pide nada */}
      <Link
        to={cartaPath}
        className="mt-6 inline-flex items-center gap-2 text-[0.78rem] text-light/45 transition-colors hover:text-light"
      >
        <UtensilsCrossed className="w-4 h-4" />
        Ver la carta sin entrar
      </Link>
    </motion.div>
  );
};

export default DeliveryLoginWall;
