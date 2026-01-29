import { Download, Save, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Componente con acciones para imagen generada
 * @param {Object} props
 * @param {string} props.imageUrl - URL de la imagen generada
 * @param {number} props.generationId - ID de la generación
 * @param {Function} props.onDownload - Callback para descargar
 * @param {Function} props.onSaveToProduct - Callback para guardar en producto
 * @param {Function} props.onRegenerate - Callback para regenerar
 * @param {Function} props.onDiscard - Callback para descartar
 * @param {boolean} props.isSaving - Estado de guardado
 * @param {boolean} props.isRegenerating - Estado de regeneración
 */
export function GeneratedImageActions({
  imageUrl,
  generationId,
  onDownload,
  onSaveToProduct,
  onRegenerate,
  onDiscard,
  isSaving = false,
  isRegenerating = false,
}) {
  const actions = [
    {
      id: 'download',
      label: 'Descargar',
      icon: Download,
      onClick: onDownload,
      variant: 'secondary',
      disabled: false,
    },
    {
      id: 'save',
      label: isSaving ? 'Guardando...' : 'Guardar en Producto',
      icon: Save,
      onClick: onSaveToProduct,
      variant: 'primary',
      disabled: isSaving,
    },
    {
      id: 'regenerate',
      label: isRegenerating ? 'Regenerando...' : 'Regenerar',
      icon: RefreshCw,
      onClick: onRegenerate,
      variant: 'ghost',
      disabled: isRegenerating,
    },
    {
      id: 'discard',
      label: 'Descartar',
      icon: Trash2,
      onClick: onDiscard,
      variant: 'danger',
      disabled: isSaving || isRegenerating,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions
          .filter((a) => a.variant === 'primary' || a.variant === 'secondary')
          .map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
                'font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                action.variant === 'primary' &&
                  'bg-gradient-to-r from-secondary to-primary text-dark hover:shadow-lg hover:shadow-secondary/30',
                action.variant === 'secondary' &&
                  'bg-dark-secondary border border-gray/20 text-light hover:bg-dark'
              )}
            >
              <action.icon
                className={cn(
                  'w-5 h-5',
                  action.disabled && action.id === 'save' && 'animate-spin'
                )}
              />
              <span>{action.label}</span>
            </button>
          ))}
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-3">
        {actions
          .filter((a) => a.variant === 'ghost' || a.variant === 'danger')
          .map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                action.variant === 'ghost' &&
                  'text-gray hover:text-light hover:bg-gray/10',
                action.variant === 'danger' &&
                  'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              )}
            >
              <action.icon
                className={cn(
                  'w-4 h-4',
                  action.disabled && action.id === 'regenerate' && 'animate-spin'
                )}
              />
              <span>{action.label}</span>
            </button>
          ))}

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
          <span className="font-medium text-light">Tip:</span> Puedes descargar
          la imagen para usarla en otros lugares o guardarla directamente en un
          producto existente.
        </p>
      </div>
    </motion.div>
  );
}

export default GeneratedImageActions;
