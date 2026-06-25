import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

/**
 * Modal que pide iniciar sesión con Google. Se usa en dos momentos:
 *  - al agregar el primer producto al carrito (login obligatorio para pedir), y
 *  - como respaldo al confirmar el pedido.
 * Al autenticarse, llama onAuthenticated() para que el flujo continúe solo.
 * `title`/`description` permiten adaptar el copy a cada contexto.
 */
const CustomerAuthGate = ({
  open,
  onClose,
  onAuthenticated,
  onError,
  title = "Inicia sesión para confirmar",
  description = "Vincula tu pedido a tu cuenta para seguirlo en tiempo real y ver tu historial. Solo te tomará un segundo.",
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-sm bg-dark border border-white/10 rounded-2xl shadow-2xl p-5"
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-full bg-gold/15 text-gold">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <h2 className="text-lg font-black text-light">
                {title}
              </h2>
              <p className="text-sm text-white/50">
                {description}
              </p>
              <div className="mt-2 w-full flex justify-center">
                <GoogleSignInButton
                  onSuccess={() => onAuthenticated?.()}
                  onError={onError}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomerAuthGate;
