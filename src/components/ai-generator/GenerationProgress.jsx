import { Loader2, Sparkles, ImageIcon, Upload } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Componente que muestra el progreso de generación de imagen.
 * @param {boolean} props.inline - Si es true, se muestra en el lugar donde irá la imagen (no popup)
 */
export function GenerationProgress({
  uploadProgress = 0,
  isUploading = false,
  isGenerating = false,
  inline = false,
}) {
  if (!isUploading && !isGenerating) return null;

  const wrapperClass = inline
    ? "min-h-[280px] flex items-center justify-center rounded-xl border border-gray/20 bg-dark/40 overflow-hidden"
    : "fixed inset-0 z-50 flex items-center justify-center bg-dark/90 backdrop-blur-sm";

  const contentClass = inline
    ? "flex flex-col items-center justify-center gap-5 w-full max-w-sm px-6 py-10"
    : "bg-dark-secondary border border-gray/20 rounded-xl p-8 max-w-md w-full mx-4";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={wrapperClass}
    >
      <div className={contentClass}>
        {/* Icono principal con animación suave */}
        <div className="relative flex items-center justify-center">
          {isUploading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="rounded-full p-4 bg-secondary/10 border border-secondary/20"
            >
              <Upload className="w-10 h-10 text-secondary" />
            </motion.div>
          )}
          {isGenerating && (
            <>
              {/* Anillo exterior pulsante */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-secondary/30"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: 72, height: 72, margin: "-8px" }}
              />
              <motion.div
                className="rounded-full p-4 bg-secondary/10 border border-secondary/20"
                animate={{
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-10 h-10 text-secondary" />
              </motion.div>
            </>
          )}
        </div>

        {/* Texto */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-light">
            {isUploading && "Subiendo imágenes..."}
            {isGenerating && "Generando imagen con IA"}
          </h3>
          <p className="text-sm text-gray/90">
            {isUploading && "Preparando los archivos"}
            {isGenerating && "Puede tomar hasta 2 minutos"}
          </p>
        </div>

        {/* Barra de progreso (solo subida) */}
        {isUploading && (
          <div className="w-full space-y-1.5">
            <div className="h-1.5 bg-dark rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray text-center">{uploadProgress}%</p>
          </div>
        )}

        {/* Indicador de carga (solo generación) */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-gray">
            <Loader2 className="w-4 h-4 animate-spin text-secondary" />
            <span className="text-xs">Procesando...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default GenerationProgress;
