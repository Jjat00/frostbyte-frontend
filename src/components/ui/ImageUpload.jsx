import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Componente de subida de imagenes con drag-and-drop
 * @param {Object} props
 * @param {string} props.value - URL de la imagen actual
 * @param {function} props.onChange - Callback cuando cambia la URL
 * @param {string} props.error - Mensaje de error externo
 * @param {boolean} props.disabled - Deshabilitar componente
 */
export function ImageUpload({ value, onChange, error: externalError, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Usa JPEG, PNG, WebP o GIF.';
    }
    if (file.size > MAX_SIZE) {
      return 'El archivo es muy grande. Tamaño máximo: 5MB';
    }
    return null;
  }, []);

  const handleUpload = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });
      onChange(result.url);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al subir la imagen';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onChange, validateFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [disabled, isUploading, handleUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input para permitir seleccionar el mismo archivo
    e.target.value = '';
  }, [handleUpload]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onChange('');
    setError(null);
  }, [onChange]);

  const displayError = externalError || error;

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all cursor-pointer',
          'min-h-[200px] flex flex-col items-center justify-center',
          isDragging && 'border-primary bg-primary/5',
          displayError && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
          !isDragging && !displayError && 'border-gray-600 hover:border-gray-500',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Preview de imagen */}
        {value && !isUploading && (
          <div className="absolute inset-0 p-2">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
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

        {/* Estado de subida */}
        {isUploading && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="w-48">
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 text-center mt-1">
                {uploadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Estado vacio */}
        {!value && !isUploading && (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            {isDragging ? (
              <ImageIcon className="w-12 h-12 text-primary" />
            ) : (
              <Upload className="w-12 h-12 text-gray-500" />
            )}
            <div>
              <p className="text-sm text-gray-300">
                {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WebP o GIF. Máximo 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {displayError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
