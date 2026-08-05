import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bike, ClipboardList, Lock, UserCircle2, UtensilsCrossed } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

/**
 * Muro de /domicilios: sin sesión de cliente no se entra a la tienda.
 *
 * Decisión de Jaime (2026-08-05): pedir a domicilio exige cuenta desde el
 * primer paso, no al confirmar. La vitrina no se pierde — la carta pública en
 * `/` sigue mostrando todos los productos y precios sin sesión —, así que
 * aquí el muro solo protege el acto de pedir.
 *
 * Solo se muestra con los pedidos en la app encendidos: si el local pide por
 * WhatsApp (`customer_ordering_enabled=false`) no hay nada que proteger.
 */
const DeliveryLoginWall = ({ storeClosed, onError }) => {
  const [error, setError] = useState("");

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
      <span className="mx-auto mb-5 grid place-items-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 text-dark">
        <Bike className="w-8 h-8" />
      </span>

      <h2 className="text-2xl font-black uppercase leading-tight">
        Entra para <span className="text-emerald-400">pedir</span>
      </h2>
      <p className="text-white/50 text-sm mt-2">
        Los domicilios van con tu cuenta de Google. Es un toque y no vuelves a
        escribir tus datos.
      </p>

      <ul className="grid gap-2.5 my-6 text-left text-sm text-white/60">
        {[
          [Bike, "Te lo llevamos hasta tu puerta"],
          [ClipboardList, "Sigues tu pedido en vivo y queda en tu historial"],
          [UserCircle2, "Tu nombre y teléfono, listos en cada pedido"],
        ].map(([Icon, text]) => (
          <li key={text} className="flex items-start gap-2.5">
            <Icon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>

      {storeClosed && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-left">
          <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/60 text-xs">
            Ahora mismo estamos cerrados: puedes entrar y dejar tu cuenta
            lista, pero no recibimos pedidos hasta que el badge diga Abierto.
          </p>
        </div>
      )}

      <GoogleSignInButton onError={handleError} />
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {/* Salida para quien solo quería mirar: la carta no pide nada */}
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white/80 transition-colors"
      >
        <UtensilsCrossed className="w-4 h-4" />
        Ver la carta sin entrar
      </Link>
    </motion.div>
  );
};

export default DeliveryLoginWall;
