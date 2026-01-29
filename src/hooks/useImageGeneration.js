import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiImageService } from '@/services/aiImage.service';
import toast from 'react-hot-toast';

/**
 * Hook para manejar la generación de imágenes con IA
 * @param {Object} options - Opciones del hook
 * @param {Function} options.onSuccess - Callback al completar generación
 * @param {Function} options.onError - Callback en error
 */
export function useImageGeneration({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mutación para generar imagen
  const generateMutation = useMutation({
    mutationFn: (params) =>
      aiImageService.generateImage({
        ...params,
        onProgress: setUploadProgress,
      }),
    onSuccess: (data) => {
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('Imagen generada exitosamente');
      onSuccess?.(data);
    },
    onError: (error) => {
      setUploadProgress(0);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Error al generar la imagen';
      toast.error(errorMessage);
      onError?.(error);
    },
  });

  // Mutación para guardar a producto
  const saveToProductMutation = useMutation({
    mutationFn: ({ generationId, productId }) =>
      aiImageService.saveToProduct(generationId, productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.slug] });
      toast.success('Imagen guardada en el producto');
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || 'Error al guardar la imagen';
      toast.error(errorMessage);
    },
  });

  // Mutación para regenerar
  const regenerateMutation = useMutation({
    mutationFn: ({ generationId, params }) =>
      aiImageService.regenerateImage(generationId, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('Imagen regenerada exitosamente');
      onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || 'Error al regenerar la imagen';
      toast.error(errorMessage);
      onError?.(error);
    },
  });

  const downloadImage = useCallback(async (imageUrl, filename) => {
    try {
      await aiImageService.downloadImage(imageUrl, filename);
      toast.success('Imagen descargada');
    } catch (error) {
      toast.error('Error al descargar la imagen');
    }
  }, []);

  return {
    // Estados
    isGenerating: generateMutation.isPending,
    isSaving: saveToProductMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    uploadProgress,
    generatedData: generateMutation.data,

    // Acciones
    generateImage: generateMutation.mutate,
    saveToProduct: saveToProductMutation.mutate,
    regenerateImage: regenerateMutation.mutate,
    downloadImage,

    // Errores
    generateError: generateMutation.error,
    saveError: saveToProductMutation.error,

    // Reset
    reset: () => {
      generateMutation.reset();
      saveToProductMutation.reset();
      regenerateMutation.reset();
      setUploadProgress(0);
    },
  };
}

/**
 * Hook para obtener el historial de generaciones
 * @param {Object} params - Parámetros de consulta
 */
export function useGenerationHistory(params = {}) {
  return useQuery({
    queryKey: ['ai-history', params],
    queryFn: () => aiImageService.getHistory(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para validar archivos de imagen
 */
export function useImageValidation() {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB para imágenes que irán a IA

  const validateFile = useCallback(
    (file) => {
      if (!file) {
        return 'Debes seleccionar una imagen';
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Formato no permitido. Usa JPG, PNG o WebP';
      }

      if (file.size > MAX_SIZE) {
        return `La imagen es muy grande. Tamaño máximo: ${MAX_SIZE / 1024 / 1024}MB`;
      }

      return null;
    },
    [ALLOWED_TYPES, MAX_SIZE]
  );

  return { validateFile, ALLOWED_TYPES, MAX_SIZE };
}

export default useImageGeneration;
