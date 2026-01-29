import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Componente toggle para activar/desactivar fondo transparente
 * @param {Object} props
 * @param {boolean} props.value - Estado actual del toggle
 * @param {Function} props.onChange - Callback cuando cambia el estado
 * @param {boolean} props.disabled - Deshabilitar toggle
 */
export function TransparencyToggle({ value, onChange, disabled = false }) {
  return (
    <div className="bg-dark-secondary border border-gray/20 rounded-lg p-4">
      <label
        className={cn(
          'flex items-start gap-4 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Toggle switch */}
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={cn(
              'w-11 h-6 rounded-full transition-colors',
              'peer-checked:bg-secondary peer-focus:ring-2 peer-focus:ring-secondary/30',
              value ? 'bg-secondary' : 'bg-gray/30'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white',
                'transition-transform',
                value && 'translate-x-5'
              )}
            />
          </div>
        </div>

        {/* Label and description */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-light">
              Fondo Transparente
            </span>
            {value && (
              <CheckCircle2 className="w-4 h-4 text-secondary" />
            )}
          </div>
          <p className="text-xs text-gray">
            {value
              ? 'La imagen generada tendrá el fondo removido automáticamente'
              : 'La imagen mantendrá su fondo original o será procesada con fondo'}
          </p>

          {/* Info adicional */}
          {value && (
            <div className="mt-2 p-2 bg-secondary/10 border border-secondary/20 rounded text-xs text-secondary">
              Perfecto para crear composiciones personalizadas o usar sobre diferentes fondos
            </div>
          )}
        </div>
      </label>

      {/* Visual example */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-center">
          <div
            className={cn(
              'h-20 rounded-lg border-2 mb-2 transition-all',
              !value
                ? 'border-secondary bg-gradient-to-br from-gray/20 to-gray/5'
                : 'border-gray/20 bg-dark'
            )}
          >
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg" />
            </div>
          </div>
          <span className="text-xs text-gray">Con fondo</span>
        </div>

        <div className="text-center">
          <div
            className={cn(
              'h-20 rounded-lg border-2 mb-2 transition-all',
              'bg-[length:10px_10px]',
              value
                ? 'border-secondary bg-[linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333),linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333)]'
                : 'border-gray/20 bg-dark',
              value && 'bg-[position:0_0,5px_5px]'
            )}
          >
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg" />
            </div>
          </div>
          <span className="text-xs text-gray">Transparente</span>
        </div>
      </div>
    </div>
  );
}

export default TransparencyToggle;
