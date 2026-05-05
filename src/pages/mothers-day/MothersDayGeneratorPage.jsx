/**
 * MothersDayGeneratorPage
 *
 * Public page for AI-powered Mother's Day greeting card generation.
 *
 * Route: /dia-madre/generador
 */

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Loader2,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { env } from "@/config/env";

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {/* Fondo cálido maternal: rosa profundo a durazno tenue */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#2a1218] via-[#241019] to-[#1a0c14]" />

    <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-pink-300/12 rounded-full blur-[140px] animate-pulse" />
    <div
      className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-amber-300/10 rounded-full blur-[120px] animate-pulse"
      style={{ animationDelay: "1.5s" }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-rose-300/[0.07] rounded-full blur-[180px] animate-pulse"
      style={{ animationDelay: "3s" }}
    />

    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,180,200,0.6) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);

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
      <label className="block text-pink-100 text-sm font-semibold tracking-wide">
        Foto de mam&aacute;{" "}
        <span className="text-pink-300" aria-label="requerido">
          *
        </span>
      </label>

      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border-2 border-pink-300/50 group"
        >
          <img
            src={preview}
            alt="Vista previa de la foto de mam&aacute;"
            className="w-full h-56 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar foto"
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-pink-400/80 rounded-full text-white transition-colors duration-200 border border-pink-300/40"
          >
            <X size={16} />
          </button>
          <p className="absolute bottom-3 left-3 text-white/85 text-xs font-medium">
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
              ? "rgba(244,143,177,0.8)"
              : "rgba(244,143,177,0.3)",
            backgroundColor: isDragging
              ? "rgba(244,143,177,0.08)"
              : "rgba(244,143,177,0.03)",
          }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center gap-3 h-48 sm:h-56 rounded-2xl border-2 border-dashed border-pink-300/30 cursor-pointer hover:border-pink-300/60 hover:bg-pink-400/5 transition-colors duration-200 select-none"
        >
          <div className="p-3 bg-pink-300/15 rounded-full border border-pink-300/30">
            <Upload size={24} className="text-pink-200" />
          </div>
          <div className="text-center px-4">
            <p className="text-pink-100 font-semibold text-sm">
              Arrastra la foto aqu&iacute;
            </p>
            <p className="text-pink-200/55 text-xs mt-1">
              o haz clic para seleccionar
            </p>
            <p className="text-pink-200/45 text-xs mt-2">
              JPG, PNG, WEBP &mdash; m&aacute;x 10 MB
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
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full border-4 border-pink-900/40" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-pink-300 border-r-amber-300"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Heart size={28} className="text-pink-200 fill-pink-200 animate-pulse" />
      </div>
    </div>

    <div className="flex gap-2 mb-5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, delay: i * 0.25, repeat: Infinity }}
          className="w-2.5 h-2.5 rounded-full bg-pink-300"
        />
      ))}
    </div>

    <p className="text-pink-100 font-semibold text-lg text-center px-6 max-w-xs leading-snug">
      Creando tu tarjeta llena de amor...
    </p>
    <p className="text-pink-200/55 text-sm mt-2 text-center px-6">
      Esto puede tomar unos segundos
    </p>
  </motion.div>
);

const ResultCard = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(null);

  const dataUri = `data:${result.mime_type};base64,${result.image_base64}`;
  const fileName = "feliz-dia-mama.png";

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
            title: "Feliz Día Mamá",
            text: result.phrase_used || "Feliz Día Mamá",
            files: [file],
          });
          return;
        }
        await navigator.share({
          title: "Feliz Día Mamá",
          text: result.phrase_used || "Feliz Día Mamá",
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setShareError("No se pudo compartir. Puedes descargar la imagen.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(dataUri);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        setShareError("No se pudo copiar. Usa el botón de descarga.");
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
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-300/20 to-amber-300/20 border border-pink-300/50 rounded-full"
        >
          <Heart size={14} className="text-pink-200 fill-pink-200" />
          <span className="text-pink-200 text-xs font-semibold tracking-wider">
            TARJETA LISTA
          </span>
        </motion.div>
        <h2 className="text-pink-50 text-xl font-bold">
          Tu tarjeta para mam&aacute;
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden border-2 border-pink-300/40 shadow-[0_0_40px_rgba(248,165,184,0.2)]"
      >
        <img
          src={dataUri}
          alt="Tarjeta del Día de la Madre generada con IA"
          className="w-full object-contain"
        />
      </motion.div>

      {result.phrase_used && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="px-5 py-3 bg-gradient-to-r from-pink-300/10 via-rose-300/10 to-amber-300/10 border border-pink-300/30 rounded-xl"
        >
          <p className="text-pink-200 text-sm font-medium italic text-center leading-relaxed">
            &ldquo;{result.phrase_used}&rdquo;
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {shareError && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-pink-200/70 text-sm"
          >
            {shareError}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 text-white font-semibold text-sm rounded-xl hover:shadow-[0_0_24px_rgba(244,143,177,0.45)] hover:from-pink-300 hover:via-rose-300 hover:to-amber-200 transition-all duration-200 active:scale-95"
          aria-label="Descargar tarjeta como imagen PNG"
        >
          <Download size={17} />
          Descargar
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-pink-400/10 border-2 border-pink-300/50 text-pink-100 font-semibold text-sm rounded-xl hover:bg-pink-400/20 hover:border-pink-300 hover:shadow-[0_0_20px_rgba(248,165,184,0.25)] transition-all duration-200 active:scale-95"
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-pink-200/65 hover:text-pink-100 font-medium text-sm rounded-xl transition-colors duration-200 hover:bg-pink-400/5 border border-transparent hover:border-pink-300/20"
          aria-label="Crear otra tarjeta"
        >
          <RefreshCw size={15} />
          Crear otra tarjeta
        </button>
      </motion.div>
    </motion.div>
  );
};

const MothersDayGeneratorPage = () => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [phrase, setPhrase] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fromName, setFromName] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  const handleGeneratePhrase = async () => {
    setIsGeneratingPhrase(true);
    setError(null);
    try {
      const response = await fetch(
        `${env.API_BASE_URL}/motivational/generate-mothers-day-phrase/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mother_name: motherName.trim() || undefined,
          }),
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!photoFile) {
      setError("Por favor sube la foto de mamá para continuar.");
      return;
    }

    setIsGenerating(true);

    const formData = new FormData();
    formData.append("image", photoFile);
    if (phrase.trim()) formData.append("phrase", phrase.trim());
    if (motherName.trim()) formData.append("mother_name", motherName.trim());
    if (fromName.trim()) formData.append("from_name", fromName.trim());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(
        `${env.API_BASE_URL}/motivational/generate-mothers-day-image/`,
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
          "La generación tardó demasiado tiempo. Por favor intenta de nuevo."
        );
      } else {
        setError(
          err.message ||
            "Ocurrió un error al generar la imagen. Por favor intenta de nuevo."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhrase("");
    setMotherName("");
    setFromName("");
    setIsGeneratingPhrase(false);
  };

  return (
    <>
      <AnimatedBackground />

      <AnimatePresence>{isGenerating && <GeneratingOverlay />}</AnimatePresence>

      <main
        className="relative min-h-screen flex flex-col items-center px-4 py-12 sm:py-16"
        aria-label="Generador de tarjetas del Día de la Madre"
      >
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-pink-200/70 hover:text-pink-100 text-sm font-medium rounded-lg hover:bg-pink-400/10 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Volver a la carta
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10 sm:mb-12 w-full max-w-lg"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-300/20 to-amber-300/20 border border-pink-300/50 rounded-full text-pink-200 text-xs font-semibold tracking-widest mb-4">
            <Heart size={12} className="fill-pink-300 text-pink-300" />
            FROSTBYTE &middot; D&Iacute;A DE LA MADRE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Tarjeta para{" "}
            <span className="bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
              Mam&aacute;
            </span>
          </h1>
          <p className="mt-3 text-pink-100/65 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            Sube una foto de mam&aacute; y crea una tarjeta llena de amor con IA
            para regalarle el d&iacute;a m&aacute;s especial.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {result ? (
            <ResultCard key="result" result={result} onReset={handleReset} />
          ) : (
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
                aria-label="Formulario para generar tarjeta del Día de la Madre"
                className="space-y-5 p-6 sm:p-8 bg-white/[0.03] backdrop-blur-sm border border-pink-300/20 rounded-3xl shadow-[0_0_60px_rgba(248,165,184,0.08)]"
              >
                <PhotoDropzone
                  file={photoFile}
                  preview={photoPreview}
                  onFile={handleFileSelect}
                  onRemove={handleFileRemove}
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="gen-phrase"
                    className="block text-pink-100 text-sm font-semibold tracking-wide"
                  >
                    Mensaje de amor
                  </label>
                  <textarea
                    id="gen-phrase"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="Genera un mensaje con IA o escribe el tuyo..."
                    rows={3}
                    maxLength={300}
                    className="w-full bg-pink-400/5 border border-pink-300/25 rounded-xl px-4 py-3 text-pink-50 placeholder-pink-200/35 text-sm resize-none focus:outline-none focus:border-pink-300/60 focus:bg-pink-400/8 transition-colors duration-200"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGeneratePhrase}
                      disabled={isGeneratingPhrase}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-400/10 border border-pink-300/30 rounded-lg text-pink-200 text-xs font-semibold hover:bg-pink-400/20 hover:border-pink-300/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="text-pink-200/35 text-xs">
                      {phrase.length}/300
                    </p>
                  </div>
                  {!phrase && (
                    <p className="text-pink-200/40 text-xs">
                      Puedes generar una frase con IA y luego editarla a tu gusto
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="gen-mother-name"
                    className="block text-pink-100 text-sm font-semibold tracking-wide"
                  >
                    Nombre de mam&aacute;{" "}
                    <span className="text-pink-200/40 font-normal">
                      (opcional)
                    </span>
                  </label>
                  <input
                    id="gen-mother-name"
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Nombre de mam&aacute;"
                    maxLength={80}
                    className="w-full bg-pink-400/5 border border-pink-300/25 rounded-xl px-4 py-3 text-pink-50 placeholder-pink-200/35 text-sm focus:outline-none focus:border-pink-300/60 focus:bg-pink-400/8 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="gen-from-name"
                    className="block text-pink-100 text-sm font-semibold tracking-wide"
                  >
                    De parte de{" "}
                    <span className="text-pink-200/40 font-normal">
                      (opcional)
                    </span>
                  </label>
                  <input
                    id="gen-from-name"
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Tu nombre, tu hijo..."
                    maxLength={80}
                    className="w-full bg-pink-400/5 border border-pink-300/25 rounded-xl px-4 py-3 text-pink-50 placeholder-pink-200/35 text-sm focus:outline-none focus:border-pink-300/60 focus:bg-pink-400/8 transition-colors duration-200"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      role="alert"
                      className="flex items-start gap-2 px-4 py-3 bg-rose-900/30 border border-rose-500/50 rounded-xl text-rose-200 text-sm"
                    >
                      <X size={15} className="mt-0.5 shrink-0 text-rose-300" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isGenerating || !photoFile}
                  whileHover={!isGenerating && photoFile ? { scale: 1.02 } : {}}
                  whileTap={!isGenerating && photoFile ? { scale: 0.98 } : {}}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 text-white font-bold text-base rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:from-pink-300 hover:via-rose-300 hover:to-amber-200 hover:shadow-[0_0_30px_rgba(244,143,177,0.45)] transition-all duration-200"
                  aria-busy={isGenerating}
                  aria-disabled={isGenerating || !photoFile}
                  aria-label="Generar imagen con inteligencia artificial"
                >
                  <Sparkles size={19} />
                  Generar tarjeta
                </motion.button>

                {!photoFile && (
                  <p
                    className="text-center text-pink-200/40 text-xs"
                    aria-live="polite"
                  >
                    Sube la foto de mam&aacute; para poder generar la tarjeta
                  </p>
                )}
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-pink-200/30 text-xs mt-6"
              >
                Hecho con amor por{" "}
                <span className="text-pink-200/55 font-semibold">Frostbyte</span>{" "}
                &middot; Cumbal, Nari&ntilde;o
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

export default MothersDayGeneratorPage;
