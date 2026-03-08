/**
 * WomensDayGeneratorPage
 *
 * Public page for AI-powered Women's Day (8M) greeting card generation.
 *
 * Usage:
 *   Route: /8m/generador
 *   No authentication required.
 *
 * Flow:
 *   1. User uploads a photo (required), fills optional fields.
 *   2. Hits "Generar imagen" → POST multipart/form-data to API.
 *   3. Result panel shows generated image with download/share actions.
 *   4. "Crear otra" resets the form.
 */

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Download,
  Share2,
  RefreshCw,
  ImageIcon,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated petal / sparkle background — pure CSS, no canvas needed */
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0812] via-[#1f0a18] to-[#0a0b14]" />

    {/* Ambient glow blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-rose-500/10 rounded-full blur-[140px] animate-pulse" />
    <div
      className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-pink-400/8 rounded-full blur-[120px] animate-pulse"
      style={{ animationDelay: "1.5s" }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-rose-300/[0.06] rounded-full blur-[180px] animate-pulse"
      style={{ animationDelay: "3s" }}
    />

    {/* Decorative grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,105,135,0.6) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);

/** Photo dropzone with preview */
const PhotoDropzone = ({ file, preview, onFile, onRemove }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.type.startsWith("image/")) {
        onFile(dropped);
      }
    },
    [onFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFile(selected);
  };

  return (
    <div className="space-y-2">
      <label className="block text-rose-200 text-sm font-semibold tracking-wide">
        Tu foto{" "}
        <span className="text-rose-400" aria-label="requerido">
          *
        </span>
      </label>

      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border-2 border-rose-400/50 group"
        >
          <img
            src={preview}
            alt="Vista previa de tu foto"
            className="w-full h-56 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar foto"
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-rose-500/80 rounded-full text-white transition-colors duration-200 border border-rose-400/40"
          >
            <X size={16} />
          </button>
          <p className="absolute bottom-3 left-3 text-white/80 text-xs font-medium">
            {file?.name}
          </p>
        </motion.div>
      ) : (
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Subir foto. Arrastra y suelta o haz clic para seleccionar"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          animate={{
            borderColor: isDragging
              ? "rgba(244,63,94,0.8)"
              : "rgba(244,63,94,0.3)",
            backgroundColor: isDragging
              ? "rgba(244,63,94,0.08)"
              : "rgba(244,63,94,0.03)",
          }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center gap-3 h-48 sm:h-56 rounded-2xl border-2 border-dashed border-rose-400/30 cursor-pointer hover:border-rose-400/60 hover:bg-rose-500/5 transition-colors duration-200 select-none"
        >
          <div className="p-3 bg-rose-500/15 rounded-full border border-rose-400/30">
            <Upload size={24} className="text-rose-400" />
          </div>
          <div className="text-center px-4">
            <p className="text-rose-200 font-semibold text-sm">
              Arrastra tu foto aqui
            </p>
            <p className="text-rose-300/50 text-xs mt-1">
              o haz clic para seleccionar
            </p>
            <p className="text-rose-300/40 text-xs mt-2">
              JPG, PNG, WEBP — max 10 MB
            </p>
          </div>
        </motion.div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
};

/** Loading overlay shown during generation */
const GeneratingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0510]/90 backdrop-blur-sm"
    role="status"
    aria-live="polite"
    aria-label="Generando tu tarjeta especial, por favor espera"
  >
    {/* Spinning rose gradient ring */}
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full border-4 border-rose-900/40" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-rose-500 border-r-pink-400"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles size={28} className="text-rose-300 animate-pulse" />
      </div>
    </div>

    {/* Pulsing dots */}
    <div className="flex gap-2 mb-5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, delay: i * 0.25, repeat: Infinity }}
          className="w-2.5 h-2.5 rounded-full bg-rose-400"
        />
      ))}
    </div>

    <p className="text-rose-200 font-semibold text-lg text-center px-6 max-w-xs leading-snug">
      Creando tu tarjeta especial...
    </p>
    <p className="text-rose-300/50 text-sm mt-2 text-center px-6">
      Esto puede tomar unos segundos
    </p>
  </motion.div>
);

/** Result card shown after successful generation */
const ResultCard = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(null);

  const dataUri = `data:${result.mime_type};base64,${result.image_base64}`;
  const fileName = "feliz-dia-de-la-mujer.png";

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    setShareError(null);
    if (navigator.share) {
      try {
        const blob = base64ToBlob(result.image_base64, result.mime_type);
        const file = new File([blob], fileName, { type: result.mime_type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Feliz Dia Internacional de la Mujer",
            text: result.phrase_used || "Feliz 8M",
            files: [file],
          });
          return;
        }
        // Fallback: share without file
        await navigator.share({
          title: "Feliz Dia Internacional de la Mujer",
          text: result.phrase_used || "Feliz 8M",
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setShareError("No se pudo compartir. Puedes descargar la imagen.");
        }
      }
    } else {
      // Copy data URI to clipboard as last resort
      try {
        await navigator.clipboard.writeText(dataUri);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        setShareError("No se pudo copiar. Usa el boton de descarga.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full max-w-lg mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/50 rounded-full"
        >
          <Sparkles size={14} className="text-rose-400" />
          <span className="text-rose-300 text-xs font-semibold tracking-wider">
            TARJETA LISTA
          </span>
        </motion.div>
        <h2 className="text-rose-100 text-xl font-bold">
          Tu tarjeta del 8M
        </h2>
      </div>

      {/* Generated image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden border-2 border-rose-400/40 shadow-[0_0_40px_rgba(244,63,94,0.15)]"
      >
        <img
          src={dataUri}
          alt="Tarjeta del Dia Internacional de la Mujer generada con IA"
          className="w-full object-contain"
        />
      </motion.div>

      {/* Phrase used */}
      {result.phrase_used && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="px-5 py-3 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 border border-rose-400/30 rounded-xl"
        >
          <p className="text-rose-300 text-sm font-medium italic text-center leading-relaxed">
            "{result.phrase_used}"
          </p>
        </motion.div>
      )}

      {/* Share error */}
      <AnimatePresence>
        {shareError && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-rose-300/70 text-sm"
          >
            {shareError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm rounded-xl hover:shadow-[0_0_24px_rgba(244,63,94,0.4)] hover:from-rose-400 hover:to-pink-400 transition-all duration-200 active:scale-95"
          aria-label="Descargar tarjeta como imagen PNG"
        >
          <Download size={17} />
          Descargar
        </button>

        {/* Share / Copy */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/10 border-2 border-rose-400/50 text-rose-300 font-semibold text-sm rounded-xl hover:bg-rose-500/20 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all duration-200 active:scale-95"
          aria-label={
            navigator.share ? "Compartir tarjeta" : "Copiar imagen al portapapeles"
          }
        >
          {copied ? (
            <>
              <Check size={17} className="text-green-400" />
              <span className="text-green-400">Copiado</span>
            </>
          ) : (
            <>
              {navigator.share ? (
                <Share2 size={17} />
              ) : (
                <Copy size={17} />
              )}
              {navigator.share ? "Compartir" : "Copiar"}
            </>
          )}
        </button>
      </motion.div>

      {/* Reset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-rose-300/60 hover:text-rose-300 font-medium text-sm rounded-xl transition-colors duration-200 hover:bg-rose-500/5 border border-transparent hover:border-rose-400/20"
          aria-label="Crear otra tarjeta"
        >
          <RefreshCw size={15} />
          Crear otra tarjeta
        </button>
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const WomensDayGeneratorPage = () => {
  // Form state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [phrase, setPhrase] = useState("");
  const [womanName, setWomanName] = useState("");
  const [fromName, setFromName] = useState("");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // -------------------------------------------------------------------------
  // File handling
  // -------------------------------------------------------------------------
  const handleFileSelect = useCallback((file) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    setError(null);
  }, []);

  const handleFileRemove = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
  }, []);

  // -------------------------------------------------------------------------
  // AI phrase generation
  // -------------------------------------------------------------------------
  const handleGeneratePhrase = async () => {
    setIsGeneratingPhrase(true);
    setError(null);
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/motivational/generate-8m-phrase/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ woman_name: womanName.trim() || undefined }),
        }
      );
      if (!response.ok) {
        throw new Error("No se pudo generar la frase");
      }
      const data = await response.json();
      if (data.phrase) {
        setPhrase(data.phrase);
      }
    } catch (err) {
      setError(err.message || "Error al generar frase. Intenta de nuevo.");
    } finally {
      setIsGeneratingPhrase(false);
    }
  };

  // -------------------------------------------------------------------------
  // Image generation
  // -------------------------------------------------------------------------
  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!photoFile) {
      setError("Por favor sube tu foto para continuar.");
      return;
    }

    setIsGenerating(true);

    const formData = new FormData();
    formData.append("image", photoFile);
    if (phrase.trim()) formData.append("phrase", phrase.trim());
    if (womanName.trim()) formData.append("woman_name", womanName.trim());
    if (fromName.trim()) formData.append("from_name", fromName.trim());

    // 60-second timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(
        `${env.API_BASE_URL}/motivational/generate-8m-image/`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
          const data = await response.json();
          message = data?.detail || data?.error || message;
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const data = await response.json();

      if (!data.image_base64) {
        throw new Error("La respuesta del servidor no contiene la imagen.");
      }

      setResult(data);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError(
          "La generacion tardo demasiado tiempo. Por favor intenta de nuevo."
        );
      } else {
        setError(
          err.message ||
            "Ocurrio un error al generar la imagen. Por favor intenta de nuevo."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  const handleReset = () => {
    setResult(null);
    setError(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhrase("");
    setWomanName("");
    setFromName("");
    setIsGeneratingPhrase(false);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <AnimatedBackground />

      {/* Loading overlay */}
      <AnimatePresence>{isGenerating && <GeneratingOverlay />}</AnimatePresence>

      <main
        className="relative min-h-screen flex flex-col items-center px-4 py-12 sm:py-16"
        aria-label="Generador de tarjetas del Dia Internacional de la Mujer"
      >
        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10 sm:mb-12 w-full max-w-lg"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/50 rounded-full text-rose-300 text-xs font-semibold tracking-widest mb-4">
            FROSTBYTE &middot; 8M
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Tarjeta del{" "}
            <span className="bg-gradient-to-r from-rose-300 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Dia de la Mujer
            </span>
          </h1>
          <p className="mt-3 text-rose-200/60 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            Sube tu foto y crea una tarjeta personalizada con IA para
            celebrar a una mujer especial.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {result ? (
            /* ---- Result view ---- */
            <ResultCard key="result" result={result} onReset={handleReset} />
          ) : (
            /* ---- Form view ---- */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ delay: 0.15 }}
              className="w-full max-w-lg"
            >
              <form
                onSubmit={handleGenerate}
                noValidate
                aria-label="Formulario para generar tarjeta del Dia de la Mujer"
                className="space-y-5 p-6 sm:p-8 bg-white/[0.03] backdrop-blur-sm border border-rose-400/20 rounded-3xl shadow-[0_0_60px_rgba(244,63,94,0.05)]"
              >
                {/* Photo upload */}
                <PhotoDropzone
                  file={photoFile}
                  preview={photoPreview}
                  onFile={handleFileSelect}
                  onRemove={handleFileRemove}
                />

                {/* Phrase — AI generated + editable */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="gen-phrase"
                    className="block text-rose-200 text-sm font-semibold tracking-wide"
                  >
                    Mensaje especial
                  </label>
                  <textarea
                    id="gen-phrase"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="Genera un mensaje con IA o escribe el tuyo..."
                    rows={3}
                    maxLength={300}
                    className="w-full bg-rose-500/5 border border-rose-400/25 rounded-xl px-4 py-3 text-rose-100 placeholder-rose-300/30 text-sm resize-none focus:outline-none focus:border-rose-400/60 focus:bg-rose-500/8 transition-colors duration-200"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGeneratePhrase}
                      disabled={isGeneratingPhrase}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-400/30 rounded-lg text-rose-300 text-xs font-semibold hover:bg-rose-500/20 hover:border-rose-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPhrase ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          Generar con IA
                        </>
                      )}
                    </button>
                    <p className="text-rose-300/30 text-xs">
                      {phrase.length}/300
                    </p>
                  </div>
                  {!phrase && (
                    <p className="text-rose-300/35 text-xs">
                      Puedes generar una frase con IA y luego editarla a tu gusto
                    </p>
                  )}
                </div>

                {/* Woman name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="gen-woman-name"
                    className="block text-rose-200 text-sm font-semibold tracking-wide"
                  >
                    Nombre de la mujer{" "}
                    <span className="text-rose-300/40 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="gen-woman-name"
                    type="text"
                    value={womanName}
                    onChange={(e) => setWomanName(e.target.value)}
                    placeholder="Nombre de la mujer"
                    maxLength={80}
                    className="w-full bg-rose-500/5 border border-rose-400/25 rounded-xl px-4 py-3 text-rose-100 placeholder-rose-300/30 text-sm focus:outline-none focus:border-rose-400/60 focus:bg-rose-500/8 transition-colors duration-200"
                  />
                </div>

                {/* From name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="gen-from-name"
                    className="block text-rose-200 text-sm font-semibold tracking-wide"
                  >
                    De parte de{" "}
                    <span className="text-rose-300/40 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="gen-from-name"
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="De parte de..."
                    maxLength={80}
                    className="w-full bg-rose-500/5 border border-rose-400/25 rounded-xl px-4 py-3 text-rose-100 placeholder-rose-300/30 text-sm focus:outline-none focus:border-rose-400/60 focus:bg-rose-500/8 transition-colors duration-200"
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      role="alert"
                      className="flex items-start gap-2 px-4 py-3 bg-rose-900/30 border border-rose-500/50 rounded-xl text-rose-300 text-sm"
                    >
                      <X size={15} className="mt-0.5 shrink-0 text-rose-400" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isGenerating || !photoFile}
                  whileHover={!isGenerating && photoFile ? { scale: 1.02 } : {}}
                  whileTap={!isGenerating && photoFile ? { scale: 0.98 } : {}}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-base rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:from-rose-400 hover:to-pink-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.45)] transition-all duration-200"
                  aria-busy={isGenerating}
                  aria-disabled={isGenerating || !photoFile}
                  aria-label="Generar imagen con inteligencia artificial"
                >
                  <Sparkles size={19} />
                  Generar imagen
                </motion.button>

                {!photoFile && (
                  <p className="text-center text-rose-300/40 text-xs" aria-live="polite">
                    Sube tu foto para poder generar la tarjeta
                  </p>
                )}
              </form>

              {/* Branding footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-rose-300/25 text-xs mt-6"
              >
                Hecho con amor por{" "}
                <span className="text-rose-300/45 font-semibold">Frostbyte</span>{" "}
                &middot; Cumbal, Narino
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

export default WomensDayGeneratorPage;
