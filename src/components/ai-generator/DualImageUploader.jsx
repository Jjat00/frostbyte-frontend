import { useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';

/**
 * Componente para subir dos imágenes: original y referencia
 * @param {Object} props
 * @param {Function} props.onOriginalSelect - Callback cuando se selecciona imagen original
 * @param {Function} props.onReferenceSelect - Callback cuando se selecciona imagen de referencia
 * @param {string} props.originalError - Error de validación para imagen original
 * @param {string} props.referenceError - Error de validación para imagen de referencia
 * @param {boolean} props.disabled - Deshabilitar componente
 */
export function DualImageUploader({
  onOriginalSelect,
  onReferenceSelect,
  originalError,
  referenceError,
  disabled = false,
}) {
  const originalInputRef = useRef(null);
  const referenceInputRef = useRef(null);

  const original = useImageUpload();
  const reference = useImageUpload();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Imagen Original */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-light">
          Imagen Original <span className="text-primary">*</span>
        </label>
        <p className="text-xs text-gray mb-2">
          La imagen del producto que deseas mejorar
        </p>

        <div
          onClick={() => !disabled && originalInputRef.current?.click()}
          onDrop={(e) => original.handleDrop(e, onOriginalSelect)}
          onDragOver={original.handleDragOver}
          onDragLeave={original.handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all cursor-pointer',
            'min-h-[280px] flex flex-col items-center justify-center',
            original.isDragging && 'border-primary bg-primary/5',
            (originalError || original.error) && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            !original.isDragging &&
              !originalError &&
              !original.error &&
              'border-gray/30 hover:border-gray/50'
          )}
        >
          <input
            ref={originalInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => original.handleFileSelect(e, onOriginalSelect)}
            disabled={disabled}
            className="hidden"
          />

          {/* Preview */}
          {original.preview && (
            <div className="absolute inset-0 p-2">
              <img loading="lazy" decoding="async"
                src={original.preview}
                alt="Original preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  original.clearFile();
                  onOriginalSelect?.(null);
                }}
                disabled={disabled}
                className={cn(
                  'absolute top-4 right-4 p-1.5 rounded-full',
                  'bg-red-500 hover:bg-red-600 text-white',
                  'transition-colors shadow-lg',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Empty state */}
          {!original.preview && (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              {original.isDragging ? (
                <ImageIcon className="w-12 h-12 text-primary animate-pulse" />
              ) : (
                <Upload className="w-12 h-12 text-gray" />
              )}
              <div>
                <p className="text-sm text-light">
                  {original.isDragging
                    ? 'Suelta la imagen aquí'
                    : 'Arrastra o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-gray mt-1">
                  JPG, PNG o WebP. Máximo 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {(originalError || original.error) && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{originalError || original.error}</span>
          </div>
        )}
      </div>

      {/* Imagen de Referencia */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-light">
          Imagen de Referencia{' '}
          <span className="text-gray text-xs">(Opcional)</span>
        </label>
        <p className="text-xs text-gray mb-2">
          Estilo o composición que deseas replicar
        </p>

        <div
          onClick={() => !disabled && referenceInputRef.current?.click()}
          onDrop={(e) => reference.handleDrop(e, onReferenceSelect)}
          onDragOver={reference.handleDragOver}
          onDragLeave={reference.handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all cursor-pointer',
            'min-h-[280px] flex flex-col items-center justify-center',
            reference.isDragging && 'border-secondary bg-secondary/5',
            (referenceError || reference.error) && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            !reference.isDragging &&
              !referenceError &&
              !reference.error &&
              'border-gray/30 hover:border-gray/50'
          )}
        >
          <input
            ref={referenceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => reference.handleFileSelect(e, onReferenceSelect)}
            disabled={disabled}
            className="hidden"
          />

          {/* Preview */}
          {reference.preview && (
            <div className="absolute inset-0 p-2">
              <img loading="lazy" decoding="async"
                src={reference.preview}
                alt="Reference preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reference.clearFile();
                  onReferenceSelect?.(null);
                }}
                disabled={disabled}
                className={cn(
                  'absolute top-4 right-4 p-1.5 rounded-full',
                  'bg-red-500 hover:bg-red-600 text-white',
                  'transition-colors shadow-lg',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Empty state */}
          {!reference.preview && (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              {reference.isDragging ? (
                <ImageIcon className="w-12 h-12 text-secondary animate-pulse" />
              ) : (
                <Upload className="w-12 h-12 text-gray" />
              )}
              <div>
                <p className="text-sm text-light">
                  {reference.isDragging
                    ? 'Suelta la imagen aquí'
                    : 'Arrastra o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-gray mt-1">
                  JPG, PNG o WebP. Máximo 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {(referenceError || reference.error) && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{referenceError || reference.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DualImageUploader;
