import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Sparkles } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

/**
 * Modal de inicio de sesión para clientes. Reutilizable desde cualquier
 * parte de la app (hoy la Polla; mañana, pedidos).
 *
 * Props:
 *  - open: boolean
 *  - onClose(): cerrar el modal
 *  - onAuthenticated(user): se llama al autenticar con éxito
 *  - title / subtitle: textos contextuales (tienen defaults)
 *  - benefits: string[] con razones para iniciar sesión
 */
const DEFAULT_BENEFITS = [
  "Guarda tu progreso en cualquier dispositivo",
  "Participa y compite por el premio",
  "Sin contraseñas: entras con tu cuenta de Google",
];

const AuthModal = ({
  open,
  onClose,
  onAuthenticated,
  title = "Inicia sesión",
  subtitle = "Entra con tu cuenta de Google para continuar.",
  benefits = DEFAULT_BENEFITS,
}) => {
  const [error, setError] = useState(null);

  // Cerrar con Escape y bloquear scroll de fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Limpiar error al cerrar
  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  const handleSuccess = (user) => {
    setError(null);
    onAuthenticated?.(user);
    onClose?.();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fb-card relative w-full max-w-md overflow-hidden bg-dark-secondary/97 p-6 sm:p-7"
          >

            {/* Cerrar */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-light/40 transition-colors hover:text-light"
            >
              <X size={20} />
            </button>

            <div className="relative">
              {/* Encabezado */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/[0.12] bg-linear-to-br from-primary/15 to-secondary/15">
                  <Sparkles className="h-5 w-5 text-light/75" strokeWidth={1.6} />
                </div>
                <h2 className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-light">
                  {title}
                </h2>
                <p className="mt-3 text-[0.8rem] leading-relaxed text-light/50">{subtitle}</p>
              </div>

              {/* Beneficios */}
              {benefits?.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2.5 text-[0.78rem] text-light/65"
                    >
                      <ShieldCheck size={15} className="shrink-0 text-secondary" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {/* Botón de Google */}
              <GoogleSignInButton onSuccess={handleSuccess} onError={setError} />

              {error && (
                <p className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-center text-sm text-red-300">
                  {error}
                </p>
              )}

              <p className="mt-5 text-center text-xs text-gray/70">
                Al continuar aceptas participar de forma responsable. Solo usamos
                tu nombre y correo de Google.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
