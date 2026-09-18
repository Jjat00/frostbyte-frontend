import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  AlertCircle,
  Info,
  Check,
  Loader2,
  RotateCcw,
  Trash2,
  Wand2,
} from 'lucide-react';
import { DualImageUploader } from './DualImageUploader';
import { PromptBuilder } from './PromptBuilder';
import { ModelSelector } from './ModelSelector';
import { TransparencyToggle } from './TransparencyToggle';
import { GenerationProgress } from './GenerationProgress';
import {
  useImageGeneration,
  useImageValidation,
  useGenerationHistory,
} from '@/hooks/useImageGeneration';
import { cn } from '@/lib/utils';

// Modelos que NO soportan background transparente en el endpoint de OpenAI.
const MODELS_WITHOUT_TRANSPARENCY = new Set(['gpt-image-2']);
const DEFAULT_AI_MODEL = 'gpt-image-1.5';

/**
 * Descarga una URL y la convierte en File para poder mandarla al generador.
 * R2 responde con Access-Control-Allow-Origin: * y el backend tiene el dominio
 * del panel en CORS_ALLOWED_ORIGINS, asi que ambas fuentes se pueden leer.
 */
async function urlToFile(url, fallbackName = 'imagen.png') {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`No se pudo leer la imagen (${response.status})`);
  }
  const blob = await response.blob();
  const nameFromUrl = url.split('/').pop()?.split('?')[0];
  const type = blob.type || 'image/png';
  return new File([blob], nameFromUrl || fallbackName, { type });
}

/**
 * Modal para generar o editar con IA la imagen de un producto sin salir del
 * formulario: sirve igual al crear el producto (todavia no existe en la base)
 * porque el resultado se guarda en R2 y se devuelve como URL.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal esta abierto
 * @param {function} props.onClose - Cerrar el modal
 * @param {function} props.onUse - Recibe la URL definitiva de la imagen elegida
 * @param {string} props.initialImageUrl - Imagen que ya tiene el formulario (opcional)
 * @param {string} props.productName - Nombre del producto, solo para el encabezado
 */
export function AIImageEditorModal({
  isOpen,
  onClose,
  onUse,
  initialImageUrl = null,
  productName = '',
}) {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [transparent, setTransparent] = useState(false);
  const [aiModel, setAiModel] = useState(DEFAULT_AI_MODEL);
  const [errors, setErrors] = useState({});
  const [isPreparing, setIsPreparing] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { validateFile } = useImageValidation();
  const {
    isGenerating,
    isSavingToR2,
    isDiscarding,
    uploadProgress,
    generatedData,
    generateImage,
    saveToR2,
    discardGeneration,
    generateError,
    reset,
  } = useImageGeneration();

  // El prompt con el que se hizo la imagen que ya tiene el producto, para
  // retomarlo en vez de escribirlo otra vez.
  const { data: historyData } = useGenerationHistory(
    { generated_url: initialImageUrl, page_size: 1 },
    { enabled: isOpen && !!initialImageUrl }
  );

  // Se compara la URL aunque el backend ya filtre: si la version desplegada
  // todavia ignora el parametro, devolveria una generacion cualquiera.
  const previousGeneration = useMemo(() => {
    if (!initialImageUrl) return null;
    const candidate = (historyData?.results || [])[0];
    return candidate?.generated_image_url === initialImageUrl ? candidate : null;
  }, [historyData, initialImageUrl]);

  const supportsTransparency = !MODELS_WITHOUT_TRANSPARENCY.has(aiModel);
  const hasGenerated = !!generatedData;
  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  // Al abrir con una imagen ya puesta en el formulario, arrancamos desde ella.
  useEffect(() => {
    if (!isOpen || !initialImageUrl || initialLoaded) return;

    let cancelled = false;
    setInitialLoaded(true);
    setOriginalPreview(initialImageUrl);
    setIsPreparing(true);

    urlToFile(initialImageUrl)
      .then((file) => {
        if (!cancelled) setOriginalImage(file);
      })
      .catch(() => {
        // Sin acceso al archivo, el usuario elige uno a mano
        if (!cancelled) {
          setOriginalPreview(null);
          setErrors((prev) => ({
            ...prev,
            original:
              'No se pudo cargar la imagen actual. Selecciona el archivo a mano.',
          }));
        }
      })
      .finally(() => {
        if (!cancelled) setIsPreparing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, initialImageUrl, initialLoaded]);

  // Retomar el prompt y el modelo de la generacion que produjo esa imagen
  useEffect(() => {
    if (!isOpen || !previousGeneration) return;
    setPrompt((prev) => prev || previousGeneration.user_prompt || '');
    if (previousGeneration.ai_model) setAiModel(previousGeneration.ai_model);
  }, [isOpen, previousGeneration]);

  // Si el modelo elegido no soporta transparencia, apagarla
  useEffect(() => {
    if (!supportsTransparency && transparent) setTransparent(false);
  }, [supportsTransparency, transparent]);

  const handleOriginalSelect = useCallback((file) => {
    setOriginalImage(file);
    setOriginalPreview(null);
    setErrors((prev) => ({ ...prev, original: null }));
  }, []);

  const handleReferenceSelect = useCallback((file) => {
    setReferenceImage(file);
    setErrors((prev) => ({ ...prev, reference: null }));
  }, []);

  const handleGenerate = useCallback(() => {
    const newErrors = {};

    if (!originalImage) {
      newErrors.original = 'Debes seleccionar una imagen original';
    } else {
      const error = validateFile(originalImage);
      if (error) newErrors.original = error;
    }
    if (referenceImage) {
      const error = validateFile(referenceImage);
      if (error) newErrors.reference = error;
    }
    if (prompt && prompt.length > 500) {
      newErrors.prompt = 'El prompt no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    generateImage({
      originalImage,
      referenceImage,
      prompt: prompt.trim(),
      transparent,
      aiModel,
    });
  }, [
    originalImage,
    referenceImage,
    prompt,
    transparent,
    aiModel,
    validateFile,
    generateImage,
  ]);

  // Guardar en R2 y devolver la URL definitiva al formulario
  const handleUse = useCallback(() => {
    if (!generatedData?.id) return;

    if (generatedData.is_saved_to_r2 && generatedData.generated_image_url) {
      onUse(generatedData.generated_image_url);
      onClose();
      return;
    }

    saveToR2(generatedData.id, {
      onSuccess: (data) => {
        const url = data?.urls?.generated || generatedData.generated_image_url;
        if (url) onUse(url);
        onClose();
      },
    });
  }, [generatedData, saveToR2, onUse, onClose]);

  // Seguir editando sobre el resultado: la imagen generada pasa a ser la
  // original y el prompt se conserva para ajustarlo.
  const handleContinueFromResult = useCallback(async () => {
    if (!generatedData?.id) return;

    setIsPreparing(true);
    try {
      let sourceUrl = generatedData.generated_image_url;
      let file;
      try {
        file = await urlToFile(sourceUrl);
      } catch {
        // La imagen temporal puede no ser legible: se persiste y se reintenta
        const saved = await new Promise((resolve, reject) => {
          saveToR2(generatedData.id, { onSuccess: resolve, onError: reject });
        });
        sourceUrl = saved?.urls?.generated || sourceUrl;
        file = await urlToFile(sourceUrl);
      }

      setOriginalImage(file);
      setOriginalPreview(sourceUrl);
      setReferenceImage(null);
      setErrors({});
      reset();
    } catch {
      setErrors((prev) => ({
        ...prev,
        original: 'No se pudo reutilizar la imagen generada. Intenta de nuevo.',
      }));
    } finally {
      setIsPreparing(false);
    }
  }, [generatedData, saveToR2, reset]);

  const handleStartOver = useCallback(() => {
    setOriginalImage(null);
    setOriginalPreview(null);
    setReferenceImage(null);
    setPrompt('');
    setTransparent(false);
    setAiModel(DEFAULT_AI_MODEL);
    setErrors({});
    reset();
  }, [reset]);

  const handleDiscard = useCallback(() => {
    if (generatedData?.id && !generatedData?.is_saved_to_r2) {
      discardGeneration(generatedData.id);
    } else {
      reset();
    }
  }, [generatedData, discardGeneration, reset]);

  const handleClose = useCallback(() => {
    // Al reabrir queremos volver a partir de la imagen que tenga el formulario,
    // salvo que haya un resultado sin decidir: ese se conserva.
    setInitialLoaded(false);
    if (!generatedData) {
      setOriginalImage(null);
      setOriginalPreview(null);
      setReferenceImage(null);
      setErrors({});
    }
    onClose();
  }, [generatedData, onClose]);

  const generationErrorMessage = generateError
    ? generateError.response?.data?.error ||
      generateError.response?.data?.detail ||
      (generateError.code === 'ECONNABORTED'
        ? 'La generación tardó demasiado y se canceló. Intenta de nuevo o usa un modelo más rápido.'
        : 'No se pudo generar la imagen. Intenta de nuevo o prueba con otro modelo.')
    : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-dark/80 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex w-full max-w-3xl max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl sm:rounded-xl border border-gray/20 bg-dark-secondary"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray/20 p-4">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-base font-bold text-light sm:text-lg">
                <Sparkles className="h-5 w-5 shrink-0 text-secondary" />
                Imagen con IA
              </h3>
              {productName && (
                <p className="mt-0.5 truncate text-xs text-gray">{productName}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1.5 text-gray transition-colors hover:bg-gray/10 hover:text-light"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {!hasGenerated && !isGenerating && (
              <>
                {previousGeneration && (
                  <div className="flex items-start gap-2 rounded-lg bg-secondary/10 p-3 text-xs text-light/80">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span>
                      Esta imagen se generó con IA: se retomaron su instrucción y
                      su modelo. Ajústalos o empieza de cero.
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-light">
                    1. Imágenes
                  </h4>
                  <DualImageUploader
                    onOriginalSelect={handleOriginalSelect}
                    onReferenceSelect={handleReferenceSelect}
                    originalError={errors.original}
                    referenceError={errors.reference}
                    disabled={isGenerating || isPreparing}
                    initialOriginalPreview={originalPreview}
                  />
                  {isPreparing && (
                    <p className="flex items-center gap-2 text-xs text-gray">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Preparando la imagen...
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-light">
                    2. Qué quieres lograr
                  </h4>
                  <PromptBuilder
                    value={prompt}
                    onChange={setPrompt}
                    error={errors.prompt}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-light">
                    3. Modelo
                  </h4>
                  <ModelSelector
                    value={aiModel}
                    onChange={setAiModel}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-light">
                    4. Fondo
                  </h4>
                  <TransparencyToggle
                    value={transparent}
                    onChange={setTransparent}
                    disabled={isGenerating || !supportsTransparency}
                  />
                  {!supportsTransparency && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400/90">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        El modelo seleccionado no soporta fondo transparente. Si
                        lo necesitas, usa GPT Image 1.5 o Gemini.
                      </span>
                    </div>
                  )}
                </div>

                {generationErrorMessage && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-500/10 p-4">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <div>
                      <p className="mb-1 text-sm font-medium text-red-400">
                        No se pudo generar la imagen
                      </p>
                      <p className="text-xs text-red-300">
                        {generationErrorMessage}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {isGenerating && (
              <GenerationProgress
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                isGenerating={isGenerating}
                inline
              />
            )}

            {hasGenerated && !isGenerating && (
              <div className="space-y-4">
                <div
                  className="flex min-h-[260px] w-full items-center justify-center overflow-hidden rounded-xl border border-gray/20 bg-dark/60 p-4"
                  style={
                    generatedData?.transparent_background
                      ? {
                          backgroundImage:
                            'linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)',
                          backgroundPosition: '0 0, 10px 10px',
                          backgroundSize: '20px 20px',
                        }
                      : {}
                  }
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={generatedData.generated_image_url}
                    alt="Imagen generada"
                    className="h-auto max-h-[46dvh] w-auto max-w-full object-contain"
                  />
                </div>

                <p className="text-center text-xs text-gray">
                  Puedes usarla tal cual, seguir editándola desde este resultado o
                  empezar de cero.
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="border-t border-gray/20 p-4">
            {!hasGenerated ? (
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg px-4 py-2.5 text-sm text-gray transition-colors hover:bg-gray/10 hover:text-light"
                  >
                    Cancelar
                  </button>
                  {(originalImage || originalPreview || prompt) && (
                    <button
                      type="button"
                      onClick={handleStartOver}
                      disabled={isGenerating || isPreparing}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-gray transition-colors hover:bg-gray/10 hover:text-light disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Empezar de cero
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || isPreparing || !originalImage}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold',
                    'bg-gradient-to-r from-secondary to-primary text-dark transition-all',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generar con IA</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isDiscarding || isSavingToR2}
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm text-gray transition-colors hover:bg-gray/10 hover:text-light disabled:opacity-50 sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  disabled={isSavingToR2 || isPreparing}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.12] px-4 py-2.5 text-sm text-light transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Empezar de cero
                </button>
                <button
                  type="button"
                  onClick={handleContinueFromResult}
                  disabled={isSavingToR2 || isPreparing}
                  className="flex items-center justify-center gap-2 rounded-lg border border-secondary/30 px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10 disabled:opacity-50"
                >
                  {isPreparing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Seguir editando
                </button>
                <button
                  type="button"
                  onClick={handleUse}
                  disabled={isSavingToR2 || isPreparing}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold',
                    'bg-gradient-to-r from-secondary to-primary text-dark transition-all',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {isSavingToR2 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Usar esta imagen
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AIImageEditorModal;
