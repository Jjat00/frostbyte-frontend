import { Loader2, Sparkles, ImageIcon, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Componente que muestra el progreso de generación de imagen
 * @param {Object} props
 * @param {number} props.uploadProgress - Progreso de subida (0-100)
 * @param {boolean} props.isUploading - Si está subiendo archivos
 * @param {boolean} props.isGenerating - Si está generando con IA
 */
export function GenerationProgress({
  uploadProgress = 0,
  isUploading = false,
  isGenerating = false,
}) {
  if (!isUploading && !isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark/90 backdrop-blur-sm"
    >
      <div className="bg-dark-secondary border border-gray/20 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-6">
          {/* Animated icon */}
          <div className="relative">
            {isUploading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <ImageIcon className="w-16 h-16 text-primary" />
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Wand2 className="w-16 h-16 text-secondary" />
              </motion.div>
            )}

            {/* Sparkles animation */}
            {isGenerating && (
              <>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-secondary" />
                </motion.div>
              </>
            )}
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-light mb-2">
              {isUploading && 'Subiendo imágenes...'}
              {isGenerating && 'Generando imagen con IA'}
            </h3>
            <p className="text-sm text-gray">
              {isUploading && 'Preparando los archivos para procesamiento'}
              {isGenerating &&
                'Esto puede tomar hasta 2 minutos. Por favor espera...'}
            </p>
          </div>

          {/* Progress bar para upload */}
          {isUploading && (
            <div className="w-full">
              <div className="bg-dark rounded-full h-3 overflow-hidden mb-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-secondary h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-center text-sm text-gray">
                {uploadProgress}% completado
              </p>
            </div>
          )}

          {/* Animated loader para generación */}
          {isGenerating && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-secondary animate-spin" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-secondary rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fun facts mientras espera */}
          {isGenerating && (
            <div className="bg-dark border border-gray/20 rounded-lg p-4 w-full">
              <p className="text-xs text-gray italic text-center">
                La IA está analizando tu imagen y aplicando mejoras profesionales...
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default GenerationProgress;
