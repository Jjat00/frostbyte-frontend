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
            className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
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
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/30 bg-dark-secondary/95 p-7 shadow-2xl shadow-primary/20"
          >
            {/* Glows decorativos */}
            <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

            {/* Cerrar */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray transition-colors hover:bg-white/10 hover:text-light"
            >
              <X size={20} />
            </button>

            <div className="relative">
              {/* Encabezado */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary shadow-lg shadow-primary/40">
                  <Sparkles className="h-7 w-7 text-dark" />
                </div>
                <h2 className="font-orbitron text-2xl font-black text-light">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-gray">{subtitle}</p>
              </div>

              {/* Beneficios */}
              {benefits?.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2.5 text-sm text-light/90"
                    >
                      <ShieldCheck size={16} className="shrink-0 text-secondary" />
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
