import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Diálogo de confirmación reutilizable (mobile-first).
 *
 * Bottom-sheet en móvil, tarjeta centrada en desktop. Estética liquid-glass del
 * proyecto. Pensado para acciones que requieren confirmación explícita
 * (abrir/cerrar el local, activar/desactivar domicilios, etc.).
 *
 * @param {boolean} open
 * @param {string} title
 * @param {React.ReactNode} message
 * @param {string} [confirmLabel="Confirmar"]
 * @param {string} [cancelLabel="Cancelar"]
 * @param {"default"|"danger"|"success"} [tone="default"] - Color del botón confirmar.
 * @param {React.ComponentType} [icon] - Icono lucide opcional junto al título.
 * @param {boolean} [loading=false] - Deshabilita botones y muestra spinner.
 * @param {() => void} onConfirm
 * @param {() => void} onCancel
 */
const TONES = {
  default: {
    button: "bg-gradient-to-r from-secondary to-primary text-dark hover:opacity-90",
    iconWrap: "bg-white/[0.06] text-light",
  },
  danger: {
    button: "bg-red-500 text-white hover:bg-red-600",
    iconWrap: "bg-red-500/15 text-red-400",
  },
  success: {
    button: "bg-green-500 text-dark hover:bg-green-600",
    iconWrap: "bg-green-500/15 text-green-400",
  },
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  icon: Icon = AlertTriangle,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const toneCfg = TONES[tone] || TONES.default;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={loading ? undefined : onCancel}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md z-[71] p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div
              className="liquid-glass relative border border-white/[0.12] rounded-2xl p-5 space-y-4"
              style={{ backgroundColor: "rgba(18, 20, 31, 0.96)" }}
            >
              <div className="flex items-start gap-3">
                {Icon && (
                  <div className={cn("p-2.5 rounded-xl shrink-0", toneCfg.iconWrap)}>
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-light">{title}</h3>
                  {message && (
                    <div className="text-sm text-gray mt-1 leading-relaxed">{message}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-gray hover:text-light bg-white/[0.04] rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-lg transition-opacity disabled:opacity-50",
                    toneCfg.button
                  )}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
