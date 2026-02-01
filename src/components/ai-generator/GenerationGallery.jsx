import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Loader2,
  Calendar,
  Cloud,
  CloudOff,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useGenerationHistory } from '@/hooks/useImageGeneration';
import { GenerationDetailModal } from './GenerationDetailModal';
import { cn } from '@/lib/utils';

/**
 * Galería de imágenes generadas con IA
 */
export function GenerationGallery() {
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGenerationHistory({ page, page_size: 12 });

  const generations = data?.results || [];
  const totalPages = data?.count ? Math.ceil(data.count / 12) : 1;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Error al cargar el historial</p>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-20">
        <ImageIcon className="w-16 h-16 text-gray/30 mx-auto mb-4" />
        <p className="text-gray text-lg mb-2">No hay imágenes generadas</p>
        <p className="text-gray/70 text-sm">
          Las imágenes que generes aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {generations.map((generation, index) => (
            <motion.button
              key={generation.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedGeneration(generation)}
              className={cn(
                'group relative aspect-square rounded-xl overflow-hidden',
                'bg-dark border border-gray/20 hover:border-secondary/50',
                'transition-all hover:shadow-lg hover:shadow-secondary/10'
              )}
            >
              {/* Imagen */}
              <div
                className="absolute inset-0 flex items-center justify-center p-2"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a)',
                  backgroundPosition: '0 0, 8px 8px',
                  backgroundSize: '16px 16px',
                }}
              >
                {generation.generated_image_url ? (
                  <img
                    src={generation.generated_image_url}
                    alt="Imagen generada"
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray/30" />
                )}
              </div>

              {/* Overlay con info */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {generation.is_saved_to_r2 ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        <Cloud className="w-3 h-3" />
                        Guardado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                        <CloudOff className="w-3 h-3" />
                        Temporal
                      </span>
                    )}
                  </div>

                  {/* Fecha */}
                  <p className="text-xs text-gray flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(generation.created_at)}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <ChevronRight className="w-5 h-5 text-secondary" />
                </div>
              </div>

              {/* Status indicator (always visible) */}
              <div className="absolute top-2 right-2">
                {generation.is_saved_to_r2 ? (
                  <Cloud className="w-4 h-4 text-green-400" />
                ) : (
                  <CloudOff className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      <GenerationDetailModal
        generation={selectedGeneration}
        isOpen={!!selectedGeneration}
        onClose={() => setSelectedGeneration(null)}
      />
    </>
  );
}

export default GenerationGallery;
