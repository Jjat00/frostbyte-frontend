import { Download, Save, Cloud, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Componente con acciones para imagen generada
 * @param {Object} props
 * @param {string} props.imageUrl - URL de la imagen generada
 * @param {string} props.generationId - ID de la generación
 * @param {boolean} props.isSavedToR2 - Si ya está guardado en R2
 * @param {Function} props.onDownload - Callback para descargar
 * @param {Function} props.onSaveToR2 - Callback para guardar en R2
 * @param {Function} props.onSaveToProduct - Callback para guardar en producto
 * @param {Function} props.onDiscard - Callback para descartar
 * @param {boolean} props.isSavingToR2 - Estado de guardado en R2
 * @param {boolean} props.isSavingToProduct - Estado de guardado en producto
 * @param {boolean} props.isDiscarding - Estado de descarte
 */
export function GeneratedImageActions({
  imageUrl,
  generationId,
  isSavedToR2 = false,
  onDownload,
  onSaveToR2,
  onSaveToProduct,
  onDiscard,
  isSavingToR2 = false,
  isSavingToProduct = false,
  isDiscarding = false,
}) {
  const isProcessing = isSavingToR2 || isSavingToProduct || isDiscarding;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Status banner */}
      {isSavedToR2 ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">
            Imagen guardada permanentemente
          </span>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-center gap-2">
          <Cloud className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">
            Imagen temporal - guárdala para conservarla
          </span>
        </div>
      )}

      {/* Primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onDownload}
          disabled={isProcessing}
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
            'font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-dark-secondary border border-gray/20 text-light hover:bg-dark'
          )}
        >
          <Download className="w-5 h-5" />
          <span>Descargar</span>
        </button>

        <button
          onClick={onSaveToProduct}
          disabled={isProcessing}
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
            'font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-gradient-to-r from-secondary to-primary text-dark hover:shadow-lg hover:shadow-secondary/30'
          )}
        >
          <Save className={cn('w-5 h-5', isSavingToProduct && 'animate-spin')} />
          <span>{isSavingToProduct ? 'Guardando...' : 'Guardar en Producto'}</span>
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-3">
        {!isSavedToR2 && (
          <>
            <button
              onClick={onSaveToR2}
              disabled={isProcessing}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                'text-secondary hover:text-secondary/80 hover:bg-secondary/10'
              )}
            >
              <Cloud className={cn('w-4 h-4', isSavingToR2 && 'animate-pulse')} />
              <span>{isSavingToR2 ? 'Guardando...' : 'Guardar en la nube'}</span>
            </button>

            <button
              onClick={onDiscard}
              disabled={isProcessing}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              )}
            >
              <Trash2 className={cn('w-4 h-4', isDiscarding && 'animate-spin')} />
              <span>{isDiscarding ? 'Descartando...' : 'Descartar'}</span>
            </button>
          </>
        )}

        {/* View original link */}
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray hover:text-light hover:bg-gray/10 transition-all ml-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Ver en nueva pestaña</span>
        </a>
      </div>

      {/* Info banner */}
      <div className="bg-dark-secondary/50 border border-gray/10 rounded-lg p-4">
        <p className="text-xs text-gray text-center">
          {isSavedToR2 ? (
            <>
              <span className="font-medium text-light">Imagen guardada.</span>{' '}
              Puedes descargarla o asignarla a un producto.
            </>
          ) : (
            <>
              <span className="font-medium text-light">Imagen temporal.</span>{' '}
              Se eliminará automáticamente en 24 horas si no la guardas.
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
}

export default GeneratedImageActions;
