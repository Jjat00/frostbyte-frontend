import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { DualImageUploader } from '@/components/ai-generator/DualImageUploader';
import { PromptBuilder } from '@/components/ai-generator/PromptBuilder';
import { TransparencyToggle } from '@/components/ai-generator/TransparencyToggle';
import { GenerationProgress } from '@/components/ai-generator/GenerationProgress';
import { ImagePreview } from '@/components/ai-generator/ImagePreview';
import { GeneratedImageActions } from '@/components/ai-generator/GeneratedImageActions';
import {
  useImageGeneration,
  useImageValidation,
} from '@/hooks/useImageGeneration';
import { cn } from '@/lib/utils';

/**
 * Página principal para generación de imágenes de productos con IA
 * Integra OpenAI GPT Image 1.5 para crear imágenes profesionales
 */
const AIImageGeneratorPage = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [originalImage, setOriginalImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [transparent, setTransparent] = useState(false);
  const [errors, setErrors] = useState({});

  // Hooks personalizados
  const { validateFile } = useImageValidation();
  const {
    isGenerating,
    isSaving,
    uploadProgress,
    generatedData,
    generateImage,
    saveToProduct,
    downloadImage,
    regenerateImage,
    reset,
  } = useImageGeneration({
    onSuccess: (data) => {
      console.log('Imagen generada:', data);
    },
  });

  // Validaciones
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validar imagen original
    if (!originalImage) {
      newErrors.original = 'Debes seleccionar una imagen original';
    } else {
      const error = validateFile(originalImage);
      if (error) newErrors.original = error;
    }

    // Validar imagen de referencia (opcional)
    if (referenceImage) {
      const error = validateFile(referenceImage);
      if (error) newErrors.reference = error;
    }

    // Validar prompt (opcional, pero tiene límite)
    if (prompt && prompt.length > 500) {
      newErrors.prompt = 'El prompt no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [originalImage, referenceImage, prompt, validateFile]);

  // Handlers
  const handleGenerate = useCallback(() => {
    if (!validateForm()) return;

    generateImage({
      originalImage,
      referenceImage,
      prompt: prompt.trim(),
      transparent,
    });
  }, [
    validateForm,
    generateImage,
    originalImage,
    referenceImage,
    prompt,
    transparent,
  ]);

  const handleOriginalSelect = useCallback((file) => {
    setOriginalImage(file);
    setErrors((prev) => ({ ...prev, original: null }));
  }, []);

  const handleReferenceSelect = useCallback((file) => {
    setReferenceImage(file);
    setErrors((prev) => ({ ...prev, reference: null }));
  }, []);

  const handleDownload = useCallback(() => {
    if (generatedData?.generated_image_url) {
      const filename = `ai-generated-${Date.now()}.png`;
      downloadImage(generatedData.generated_image_url, filename);
    }
  }, [generatedData, downloadImage]);

  const handleSaveToProduct = useCallback(() => {
    // TODO: Mostrar modal para seleccionar producto
    // Por ahora solo mostramos un placeholder
    alert('Funcionalidad de guardar en producto próximamente');
  }, []);

  const handleRegenerate = useCallback(() => {
    if (generatedData?.id) {
      regenerateImage({
        generationId: generatedData.id,
        params: { prompt: prompt.trim(), transparent },
      });
    }
  }, [generatedData, prompt, transparent, regenerateImage]);

  const handleDiscard = useCallback(() => {
    if (
      window.confirm(
        '¿Estás seguro de descartar esta imagen? Esta acción no se puede deshacer.'
      )
    ) {
      reset();
    }
  }, [reset]);

  const handleStartOver = useCallback(() => {
    setOriginalImage(null);
    setReferenceImage(null);
    setPrompt('');
    setTransparent(false);
    setErrors({});
    reset();
  }, [reset]);

  // Estados de UI
  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const hasGenerated = !!generatedData;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress overlay */}
      <GenerationProgress
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        isGenerating={isGenerating}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/productos')}
          className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-light flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-secondary" />
            Generador de Imágenes con IA
          </h1>
          <p className="text-gray">
            Crea imágenes profesionales de productos usando OpenAI GPT Image
          </p>
        </div>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary/10 border border-secondary/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm text-light font-medium">
              Cómo funciona el generador de imágenes
            </p>
            <ul className="text-xs text-gray space-y-1 list-disc list-inside ml-2">
              <li>
                Sube la imagen original de tu producto (foto del celular, cámara
                básica, etc.)
              </li>
              <li>
                Opcionalmente, agrega una imagen de referencia para el estilo
                deseado
              </li>
              <li>
                Escribe instrucciones específicas o usa nuestras plantillas
                sugeridas
              </li>
              <li>
                La IA procesará tu imagen y la convertirá en una fotografía
                profesional
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {!hasGenerated ? (
        /* Formulario de generación */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Upload de imágenes */}
          <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-light">
              1. Selecciona las Imágenes
            </h2>
            <DualImageUploader
              onOriginalSelect={handleOriginalSelect}
              onReferenceSelect={handleReferenceSelect}
              originalError={errors.original}
              referenceError={errors.reference}
              disabled={isGenerating}
            />
          </div>

          {/* Prompt builder */}
          <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-light">
              2. Describe el Resultado Deseado
            </h2>
            <PromptBuilder
              value={prompt}
              onChange={setPrompt}
              error={errors.prompt}
              disabled={isGenerating}
            />
          </div>

          {/* Transparency toggle */}
          <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-light">
              3. Opciones Adicionales
            </h2>
            <TransparencyToggle
              value={transparent}
              onChange={setTransparent}
              disabled={isGenerating}
            />
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              onClick={() => navigate('/productos')}
              className="px-6 py-3 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !originalImage}
              className={cn(
                'flex items-center gap-3 px-8 py-3 rounded-lg font-bold',
                'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                'bg-gradient-to-r from-secondary to-primary text-dark',
                'hover:shadow-lg hover:shadow-secondary/30'
              )}
            >
              <Sparkles className="w-5 h-5" />
              <span>Generar Imagen con IA</span>
            </button>
          </div>

          {/* Validation errors summary */}
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400 mb-2">
                    Por favor corrige los siguientes errores:
                  </p>
                  <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Resultados */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Success banner */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-400 font-medium">
                Imagen generada exitosamente
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6">
            <ImagePreview
              originalUrl={generatedData.original_image_url}
              generatedUrl={generatedData.generated_image_url}
              prompt={generatedData.prompt}
              transparent={generatedData.transparent_background}
            />
          </div>

          {/* Actions */}
          <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6">
            <GeneratedImageActions
              imageUrl={generatedData.generated_image_url}
              generationId={generatedData.id}
              onDownload={handleDownload}
              onSaveToProduct={handleSaveToProduct}
              onRegenerate={handleRegenerate}
              onDiscard={handleDiscard}
              isSaving={isSaving}
            />
          </div>

          {/* Start over button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartOver}
              className="px-6 py-2.5 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
            >
              Generar Nueva Imagen
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIImageGeneratorPage;
