import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { DualImageUploader } from "@/components/ai-generator/DualImageUploader";
import { PromptBuilder } from "@/components/ai-generator/PromptBuilder";
import { TransparencyToggle } from "@/components/ai-generator/TransparencyToggle";
import { GenerationProgress } from "@/components/ai-generator/GenerationProgress";
import { GeneratedImageActions } from "@/components/ai-generator/GeneratedImageActions";
import { ProductSelectorModal } from "@/components/ai-generator/ProductSelectorModal";
import {
  useImageGeneration,
  useImageValidation,
} from "@/hooks/useImageGeneration";
import { cn } from "@/lib/utils";

/**
 * Página principal para generación de imágenes de productos con IA
 * Integra OpenAI GPT Image 1.5 para crear imágenes profesionales
 */
const AIImageGeneratorPage = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [originalImage, setOriginalImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [transparent, setTransparent] = useState(false);
  const [errors, setErrors] = useState({});

  // Estado del modal de selección de producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Hooks personalizados
  const { validateFile } = useImageValidation();
  const {
    isGenerating,
    isSavingToR2,
    isSavingToProduct,
    isDiscarding,
    uploadProgress,
    generatedData,
    generateImage,
    saveToR2,
    saveToProduct,
    discardGeneration,
    downloadImage,
    reset,
  } = useImageGeneration({
    onSuccess: (data) => {
      console.log("Imagen generada:", data);
    },
  });

  // Validaciones
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validar imagen original
    if (!originalImage) {
      newErrors.original = "Debes seleccionar una imagen original";
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
      newErrors.prompt = "El prompt no puede exceder 500 caracteres";
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

  const handleSaveToR2 = useCallback(() => {
    if (generatedData?.id) {
      saveToR2(generatedData.id);
    }
  }, [generatedData, saveToR2]);

  const handleSaveToProduct = useCallback(() => {
    setIsProductModalOpen(true);
  }, []);

  const handleProductSelect = useCallback(
    (productId) => {
      if (generatedData?.id) {
        saveToProduct(
          { generationId: generatedData.id, productId },
          {
            onSuccess: () => {
              setIsProductModalOpen(false);
            },
          }
        );
      }
    },
    [generatedData, saveToProduct]
  );

  const handleDiscard = useCallback(() => {
    if (
      window.confirm(
        "¿Estás seguro de descartar esta imagen? Se eliminará permanentemente.",
      )
    ) {
      if (generatedData?.id && !generatedData?.is_saved_to_r2) {
        discardGeneration(generatedData.id);
      } else {
        reset();
      }
    }
  }, [generatedData, discardGeneration, reset]);

  const handleStartOver = useCallback(() => {
    setOriginalImage(null);
    setReferenceImage(null);
    setPrompt("");
    setTransparent(false);
    setErrors({});
    reset();
  }, [reset]);

  // Estados de UI
  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const hasGenerated = !!generatedData;
  const showResultArea = isUploading || isGenerating || hasGenerated;

  // URLs para mostrar imágenes originales mientras se genera (object URLs)
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState(null);

  useEffect(() => {
    if (showResultArea && !hasGenerated && originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (hasGenerated) setOriginalPreviewUrl(null);
  }, [showResultArea, hasGenerated, originalImage]);

  useEffect(() => {
    if (showResultArea && !hasGenerated && referenceImage) {
      const url = URL.createObjectURL(referenceImage);
      setReferencePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (hasGenerated) setReferencePreviewUrl(null);
  }, [showResultArea, hasGenerated, referenceImage]);

  const displayOriginalUrl = hasGenerated
    ? generatedData?.original_image_url
    : originalPreviewUrl;
  const displayReferenceUrl = hasGenerated
    ? (generatedData?.reference_image_url ?? null)
    : referencePreviewUrl;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/productos")}
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

      {/* Formulario de generación (siempre visible hasta que haya resultado) */}
      {!hasGenerated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
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

          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              onClick={() => navigate("/productos")}
              className="px-6 py-3 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !originalImage}
              className={cn(
                "flex items-center gap-3 px-8 py-3 rounded-lg font-bold",
                "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-gradient-to-r from-secondary to-primary text-dark",
                "hover:shadow-lg hover:shadow-secondary/30",
              )}
            >
              <Sparkles className="w-5 h-5" />
              <span>Generar Imagen con IA</span>
            </button>
          </div>

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
      )}

      {/* Zona de resultado: imágenes originales + imagen generada */}
      {showResultArea && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {hasGenerated && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-sm text-green-400 font-medium">
                  Imagen generada exitosamente
                </p>
              </div>
            </div>
          )}

          <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6 sm:p-8">
            {/* Imágenes originales */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-light text-center mb-4">
                Imágenes originales
              </h3>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                {displayOriginalUrl && (
                  <div className="flex flex-col items-center w-full sm:w-auto sm:min-w-[220px] sm:max-w-[280px]">
                    <p className="text-xs text-gray mb-2 w-full text-center sm:text-left">
                      Original
                    </p>
                    <div className="w-full aspect-square max-w-[280px] bg-dark border border-gray/20 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={displayOriginalUrl}
                        alt="Imagen original"
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
                {displayReferenceUrl && (
                  <div className="flex flex-col items-center w-full sm:w-auto sm:min-w-[220px] sm:max-w-[280px]">
                    <p className="text-xs text-gray mb-2 w-full text-center sm:text-left">
                      Referencia de estilo
                    </p>
                    <div className="w-full aspect-square max-w-[280px] bg-dark border border-gray/20 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={displayReferenceUrl}
                        alt="Referencia de estilo"
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Imagen generada (loading o resultado) */}
            <div>
              <h3 className="text-lg font-bold text-light text-center mb-4">
                Imagen generada
              </h3>
              {isGenerating ? (
                <GenerationProgress
                  uploadProgress={uploadProgress}
                  isUploading={isUploading}
                  isGenerating={isGenerating}
                  inline
                />
              ) : hasGenerated ? (
                <div
                  className="w-full rounded-xl border border-gray/20 overflow-hidden aspect-video min-h-[280px] bg-dark/60 flex items-center justify-center p-4"
                  style={
                    generatedData?.transparent_background
                      ? {
                          backgroundImage:
                            "linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)",
                          backgroundPosition: "0 0, 10px 10px",
                          backgroundSize: "20px 20px",
                        }
                      : {}
                  }
                >
                  <img
                    src={generatedData.generated_image_url}
                    alt="Imagen generada"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                </div>
              ) : null}
            </div>

            {/* Prompt utilizado (solo cuando hay resultado) */}
            {hasGenerated && generatedData?.user_prompt && (
              <div className="mt-6 bg-dark border border-gray/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-light mb-2">
                  Prompt utilizado
                </h4>
                <p className="text-xs text-gray italic">
                  {generatedData.user_prompt}
                </p>
              </div>
            )}
          </div>

          {hasGenerated && (
            <>
              <div className="bg-dark-secondary border border-gray/20 rounded-xl p-6">
                <GeneratedImageActions
                  imageUrl={generatedData.generated_image_url}
                  generationId={generatedData.id}
                  isSavedToR2={generatedData.is_saved_to_r2}
                  onDownload={handleDownload}
                  onSaveToR2={handleSaveToR2}
                  onSaveToProduct={handleSaveToProduct}
                  onDiscard={handleDiscard}
                  isSavingToR2={isSavingToR2}
                  isSavingToProduct={isSavingToProduct}
                  isDiscarding={isDiscarding}
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2.5 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
                >
                  Generar Nueva Imagen
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Modal de selección de producto */}
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelect={handleProductSelect}
        isLoading={isSavingToProduct}
        generatedImageUrl={generatedData?.generated_image_url}
      />
    </div>
  );
};

export default AIImageGeneratorPage;
