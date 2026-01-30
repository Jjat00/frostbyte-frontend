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

  // Mutación para guardar en R2
  const saveToR2Mutation = useMutation({
    mutationFn: (generationId) => aiImageService.saveToR2(generationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('Imagen guardada permanentemente');
      // Actualizar los datos locales con las nuevas URLs
      if (generateMutation.data) {
        generateMutation.data.is_saved_to_r2 = true;
        generateMutation.data.original_image_url = data.urls?.original;
        generateMutation.data.reference_image_url = data.urls?.reference;
        generateMutation.data.generated_image_url = data.urls?.generated;
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || 'Error al guardar la imagen';
      toast.error(errorMessage);
    },
  });

  // Mutación para guardar a producto
  const saveToProductMutation = useMutation({
    mutationFn: ({ generationId, productId }) =>
      aiImageService.saveToProduct(generationId, productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success(`Imagen guardada en ${data.product_name}`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || 'Error al guardar la imagen';
      toast.error(errorMessage);
    },
  });

  // Mutación para descartar
  const discardMutation = useMutation({
    mutationFn: (generationId) => aiImageService.discardGeneration(generationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('Generación descartada');
      generateMutation.reset();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || 'Error al descartar la generación';
      toast.error(errorMessage);
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
    isSavingToR2: saveToR2Mutation.isPending,
    isSavingToProduct: saveToProductMutation.isPending,
    isDiscarding: discardMutation.isPending,
    uploadProgress,
    generatedData: generateMutation.data,

    // Acciones
    generateImage: generateMutation.mutate,
    saveToR2: saveToR2Mutation.mutate,
    saveToProduct: saveToProductMutation.mutate,
    discardGeneration: discardMutation.mutate,
    downloadImage,

    // Errores
    generateError: generateMutation.error,
    saveError: saveToProductMutation.error,

    // Reset
    reset: () => {
      generateMutation.reset();
      saveToR2Mutation.reset();
      saveToProductMutation.reset();
      discardMutation.reset();
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
