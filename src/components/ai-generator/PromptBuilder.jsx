import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Plantillas de prompts sugeridos
const PROMPT_TEMPLATES = [
  {
    id: 'professional',
    label: 'Fotografía profesional',
    prompt:
      'Fotografía profesional de producto para menú de restaurante, iluminación de estudio, alta resolución, fondo limpio',
  },
  {
    id: 'appetizing',
    label: 'Más apetitoso',
    prompt:
      'Hacer el producto más apetitoso y atractivo, colores vibrantes, textura detallada, presentación gourmet',
  },
  {
    id: 'minimalist',
    label: 'Estilo minimalista',
    prompt:
      'Estilo minimalista y elegante, fondo blanco limpio, sombras suaves, composición centrada',
  },
  {
    id: 'colorful',
    label: 'Más colorido',
    prompt:
      'Mejorar colores y saturación, hacer más vibrante y llamativo, iluminación cálida',
  },
  {
    id: 'premium',
    label: 'Premium/Gourmet',
    prompt:
      'Presentación premium tipo restaurante gourmet, iluminación dramática, detalles finos, aspecto lujoso',
  },
  {
    id: 'casual',
    label: 'Casual/Friendly',
    prompt:
      'Estilo casual y amigable, colores cálidos, ambiente relajado, presentación hogareña',
  },
];

/**
 * Componente para construir prompts con sugerencias
 * @param {Object} props
 * @param {string} props.value - Valor actual del prompt
 * @param {Function} props.onChange - Callback cuando cambia el prompt
 * @param {string} props.error - Mensaje de error
 * @param {boolean} props.disabled - Deshabilitar componente
 */
export function PromptBuilder({ value, onChange, error, disabled = false }) {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (template) => {
    onChange(template.prompt);
    setShowTemplates(false);
  };

  const maxLength = 500;
  const remaining = maxLength - (value?.length || 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-light">
          Instrucciones para la IA{' '}
          <span className="text-gray text-xs">(Opcional)</span>
        </label>
        <span
          className={cn(
            'text-xs',
            remaining < 50 ? 'text-red-400' : 'text-gray'
          )}
        >
          {remaining} caracteres restantes
        </span>
      </div>

      <p className="text-xs text-gray">
        Describe cómo quieres que se vea la imagen final
      </p>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        rows={4}
        placeholder="Ej: Fotografía profesional de producto con iluminación de estudio, fondo blanco limpio, alta resolución..."
        className={cn(
          'w-full px-4 py-3 bg-dark border rounded-lg text-light',
          'placeholder:text-gray focus:border-secondary/50 focus:outline-none',
          'resize-none transition-colors',
          error ? 'border-red-500' : 'border-gray/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />

      {/* Error message */}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Templates dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-dark-secondary border border-gray/20',
            'text-sm text-light hover:bg-dark transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Lightbulb className="w-4 h-4 text-secondary" />
          <span>Usar plantilla sugerida</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 ml-auto transition-transform',
              showTemplates && 'rotate-180'
            )}
          />
        </button>

        {/* Templates list */}
        {showTemplates && (
          <div className="absolute top-full left-0 right-0 mt-2 z-10">
            <div className="bg-dark-secondary border border-gray/20 rounded-lg shadow-lg overflow-hidden">
              {PROMPT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full px-4 py-3 text-left hover:bg-dark transition-colors border-b border-gray/10 last:border-b-0"
                >
                  <div className="font-medium text-light text-sm mb-1">
                    {template.label}
                  </div>
                  <div className="text-xs text-gray line-clamp-2">
                    {template.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick tips */}
      <div className="bg-dark-secondary/50 border border-gray/10 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray space-y-1">
            <p className="font-medium text-light">Tips para mejores resultados:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Sé específico sobre iluminación y composición</li>
              <li>Menciona el estilo deseado (profesional, casual, gourmet)</li>
              <li>Indica preferencias de color y fondo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptBuilder;
