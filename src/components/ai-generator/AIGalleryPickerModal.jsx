import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  Loader2,
  Check,
} from 'lucide-react';
import { useGenerationHistory } from '@/hooks/useImageGeneration';
import { cn } from '@/lib/utils';

/**
 * Modal para seleccionar una imagen de la galeria de generaciones IA
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal esta abierto
 * @param {function} props.onClose - Callback para cerrar el modal
 * @param {function} props.onSelect - Callback con la URL de la imagen seleccionada
 */
export function AIGalleryPickerModal({ isOpen, onClose, onSelect }) {
  const [page, setPage] = useState(1);
  const [selectedUrl, setSelectedUrl] = useState(null);

  const { data, isLoading, isError } = useGenerationHistory({
    page,
    page_size: 12,
  });

  const generations = (data?.results || []).filter(
    (g) => g.generated_image_url
  );
  const totalPages = data?.count ? Math.ceil(data.count / 12) : 1;

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedUrl(null);
    setPage(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[80vh] bg-dark-secondary border border-gray/20 rounded-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray/20">
              <h3 className="text-lg font-bold text-light flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-secondary" />
                Galeria de Imagenes IA
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
              )}

              {isError && (
                <div className="text-center py-20">
                  <p className="text-red-400">Error al cargar el historial</p>
                </div>
              )}

              {!isLoading && !isError && generations.length === 0 && (
                <div className="text-center py-20">
                  <ImageIcon className="w-16 h-16 text-gray/30 mx-auto mb-4" />
                  <p className="text-gray text-lg mb-2">
                    No hay imagenes generadas
                  </p>
                  <p className="text-gray/70 text-sm">
                    Genera imagenes con IA desde el modulo de generacion
                  </p>
                </div>
              )}

              {!isLoading && !isError && generations.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {generations.map((generation, index) => (
                    <motion.button
                      key={generation.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() =>
                        setSelectedUrl(generation.generated_image_url)
                      }
                      className={cn(
                        'group relative aspect-square rounded-xl overflow-hidden',
                        'bg-dark border-2 transition-all',
                        selectedUrl === generation.generated_image_url
                          ? 'border-secondary shadow-lg shadow-secondary/20'
                          : 'border-gray/20 hover:border-gray/40'
                      )}
                    >
                      <div
                        className="absolute inset-0 flex items-center justify-center p-2"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a)',
                          backgroundPosition: '0 0, 8px 8px',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        <img
                          src={generation.generated_image_url}
                          alt="Imagen generada"
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      </div>

                      {/* Selected indicator */}
                      {selectedUrl === generation.generated_image_url && (
                        <div className="absolute top-2 right-2 p-1 bg-secondary rounded-full">
                          <Check className="w-3.5 h-3.5 text-dark" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray">
                    Pagina {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray/20">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSelect}
                disabled={!selectedUrl}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-white/[0.12] bg-white/[0.04] text-dark rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Seleccionar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AIGalleryPickerModal;
