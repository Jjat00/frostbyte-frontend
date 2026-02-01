import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Trash2,
  Save,
  Cloud,
  CheckCircle,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiImageService } from '@/services/aiImage.service';
import { ProductSelectorModal } from './ProductSelectorModal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

/**
 * Modal de detalle de una generación
 * @param {Object} props
 * @param {Object} props.generation - Datos de la generación
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar
 */
export function GenerationDetailModal({ generation, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [localGeneration, setLocalGeneration] = useState(generation);

  // Update local state when generation prop changes
  useEffect(() => {
    setLocalGeneration(generation);
  }, [generation]);

  // Mutación para guardar en R2
  const saveToR2Mutation = useMutation({
    mutationFn: (generationId) => aiImageService.saveToR2(generationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('Imagen guardada permanentemente');
      setLocalGeneration((prev) => ({
        ...prev,
        is_saved_to_r2: true,
        original_image_url: data.urls?.original || prev.original_image_url,
        reference_image_url: data.urls?.reference || prev.reference_image_url,
        generated_image_url: data.urls?.generated || prev.generated_image_url,
      }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al guardar');
    },
  });

  // Mutación para guardar en producto
  const saveToProductMutation = useMutation({
    mutationFn: ({ generationId, productId }) =>
      aiImageService.saveToProduct(generationId, productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Imagen asignada a ${data.product_name}`);
      setIsProductModalOpen(false);
      setLocalGeneration((prev) => ({ ...prev, is_saved_to_r2: true }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al asignar');
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (generationId) => aiImageService.discardGeneration(generationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('Generación eliminada');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    },
  });

  const handleDownload = useCallback(async () => {
    if (localGeneration?.generated_image_url) {
      try {
        await aiImageService.downloadImage(
          localGeneration.generated_image_url,
          `ai-generated-${localGeneration.id}.png`
        );
        toast.success('Imagen descargada');
      } catch {
        toast.error('Error al descargar');
      }
    }
  }, [localGeneration]);

  const handleDelete = useCallback(() => {
    if (localGeneration?.is_saved_to_r2) {
      toast.error('No se pueden eliminar imágenes guardadas en la nube');
      return;
    }
    if (window.confirm('¿Eliminar esta generación? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(localGeneration.id);
    }
  }, [localGeneration, deleteMutation]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isProductModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProductModalOpen, onClose]);

  const isProcessing =
    saveToR2Mutation.isPending ||
    saveToProductMutation.isPending ||
    deleteMutation.isPending;

  if (!localGeneration) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onClose()}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-dark-secondary border border-gray/20 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray/20">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-light">
                  Detalle de generación
                </h2>
                {localGeneration.is_saved_to_r2 ? (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Guardado en la nube
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                    <Cloud className="w-3 h-3" />
                    Temporal (24h)
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Imágenes originales */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-light">
                    Imágenes de entrada
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Original */}
                    <div>
                      <p className="text-xs text-gray mb-2">Original</p>
                      <div
                        className="aspect-square rounded-lg overflow-hidden bg-dark border border-gray/20 flex items-center justify-center"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%)',
                          backgroundPosition: '0 0, 8px 8px',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        {localGeneration.original_image_url ? (
                          <img
                            src={localGeneration.original_image_url}
                            alt="Original"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray/30" />
                        )}
                      </div>
                    </div>

                    {/* Referencia */}
                    <div>
                      <p className="text-xs text-gray mb-2">Referencia de estilo</p>
                      <div
                        className="aspect-square rounded-lg overflow-hidden bg-dark border border-gray/20 flex items-center justify-center"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%)',
                          backgroundPosition: '0 0, 8px 8px',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        {localGeneration.reference_image_url ? (
                          <img
                            src={localGeneration.reference_image_url}
                            alt="Referencia"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-gray/30 mx-auto mb-2" />
                            <p className="text-xs text-gray/50">Sin referencia</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prompt */}
                  {localGeneration.user_prompt && (
                    <div className="bg-dark rounded-lg p-4 border border-gray/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-secondary" />
                        <p className="text-xs font-medium text-light">Prompt utilizado</p>
                      </div>
                      <p className="text-sm text-gray italic">
                        "{localGeneration.user_prompt}"
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-dark rounded-lg p-4 border border-gray/20 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray" />
                      <span className="text-gray">Creado:</span>
                      <span className="text-light">{formatDate(localGeneration.created_at)}</span>
                    </div>
                    {localGeneration.saved_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Cloud className="w-4 h-4 text-gray" />
                        <span className="text-gray">Guardado:</span>
                        <span className="text-light">{formatDate(localGeneration.saved_at)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray">Fondo transparente:</span>
                      <span className="text-light">
                        {localGeneration.transparent_background ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Imagen generada */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-light">
                    Imagen generada
                  </h3>

                  <div
                    className="aspect-square rounded-lg overflow-hidden bg-dark border border-gray/20 flex items-center justify-center p-4"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%)',
                      backgroundPosition: '0 0, 10px 10px',
                      backgroundSize: '20px 20px',
                    }}
                  >
                    {localGeneration.generated_image_url ? (
                      <img
                        src={localGeneration.generated_image_url}
                        alt="Generada"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-gray/30" />
                    )}
                  </div>

                  {/* Link externo */}
                  {localGeneration.generated_image_url && (
                    <a
                      href={localGeneration.generated_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-gray hover:text-secondary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver imagen en nueva pestaña
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-gray/20 bg-dark/50">
              <div className="flex items-center gap-2">
                {!localGeneration.is_saved_to_r2 && (
                  <>
                    <button
                      onClick={() => saveToR2Mutation.mutate(localGeneration.id)}
                      disabled={isProcessing}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                        'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                        'text-secondary hover:bg-secondary/10'
                      )}
                    >
                      {saveToR2Mutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Cloud className="w-4 h-4" />
                      )}
                      <span>Guardar en la nube</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isProcessing}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                        'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                        'text-red-400 hover:bg-red-500/10'
                      )}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Eliminar</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                    'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    'bg-dark border border-gray/20 text-light hover:bg-dark-secondary'
                  )}
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>

                <button
                  onClick={() => setIsProductModalOpen(true)}
                  disabled={isProcessing}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                    'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    'bg-gradient-to-r from-secondary to-primary text-dark',
                    'hover:shadow-lg hover:shadow-secondary/30'
                  )}
                >
                  {saveToProductMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Asignar a producto</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Modal de selección de producto */}
          <ProductSelectorModal
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            onSelect={(productId) =>
              saveToProductMutation.mutate({
                generationId: localGeneration.id,
                productId,
              })
            }
            isLoading={saveToProductMutation.isPending}
            generatedImageUrl={localGeneration.generated_image_url}
          />
        </>
      )}
    </AnimatePresence>
  );
}

export default GenerationDetailModal;
