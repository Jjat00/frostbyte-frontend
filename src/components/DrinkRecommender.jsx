import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RotateCcw, ArrowRight, Mic, MicOff } from "lucide-react";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { env } from "@/config/env";
import { ENDPOINTS } from "@/services/api/endpoints";

// ── Quiz config ──────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    key: "temperature",
    label: "¿Qué temperatura prefieres?",
    options: [
      { value: "frio", label: "Bien frío" },
      { value: "cremoso", label: "Cremoso" },
      { value: "cualquiera", label: "Me da igual" },
    ],
  },
  {
    key: "taste",
    label: "¿Qué sabor te llama?",
    options: [
      { value: "dulce", label: "Dulce" },
      { value: "acido_frutal", label: "Ácido / Frutal" },
      { value: "amargo_intenso", label: "Amargo / Intenso" },
    ],
  },
  {
    key: "alcohol",
    label: "¿Con o sin alcohol?",
    options: [
      { value: "sin_alcohol", label: "Sin alcohol" },
      { value: "con_alcohol", label: "Con alcohol" },
      { value: "cualquiera", label: "Cualquiera" },
    ],
  },
];

// ── Subcomponents ─────────────────────────────────────────────────────────────

function TabSwitcher({ active, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
      {["quiz", "mood"].map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
            active === tab
              ? "bg-gradient-to-r from-primary to-secondary text-dark"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          {tab === "quiz" ? "Quiz rápido" : "Cuéntanos"}
        </button>
      ))}
    </div>
  );
}

function MoodTab({ mood, onChange, onSubmit, loading, audio }) {
  const { isRecording, isTranscribing, elapsedSeconds, maxSeconds, startRecording, stopRecording, error: audioError } = audio;

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-white/60 text-sm">
        Cuéntanos qué se te antoja y encontramos tu bebida perfecta.
      </p>
      <div className="relative">
        <textarea
          value={mood}
          onChange={(e) => onChange(e.target.value.slice(0, 150))}
          placeholder="Ej: Tengo mucho calor y quiero algo refrescante y fuerte..."
          rows={3}
          disabled={isTranscribing}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-14 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing || loading}
          className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isRecording
              ? "bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse"
              : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30"
          }`}
          title={isRecording ? "Detener grabación" : "Grabar con micrófono"}
        >
          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Grabando... {formatTime(elapsedSeconds)} / {formatTime(maxSeconds)}
        </div>
      )}

      {isTranscribing && (
        <div className="flex items-center gap-2 text-primary text-xs">
          <Loader2 size={12} className="animate-spin" />
          Transcribiendo audio...
        </div>
      )}

      {audioError && (
        <p className="text-red-400 text-xs">{audioError}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs">{mood.length}/150</span>
        <button
          onClick={onSubmit}
          disabled={loading || mood.trim().length < 5 || isRecording || isTranscribing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-dark font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Recomendar
        </button>
      </div>
    </div>
  );
}

function QuizTab({ answers, onChange, onSubmit, loading }) {
  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.key]);

  return (
    <div className="flex flex-col gap-5">
      {QUIZ_QUESTIONS.map((q) => (
        <div key={q.key}>
          <p className="text-white/80 text-sm font-semibold mb-2">{q.label}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange(q.key, opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  answers[q.key] === opt.value
                    ? "border-primary/80 bg-primary/20 text-primary"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={onSubmit}
        disabled={loading || !allAnswered}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-dark font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity mt-1"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        Sorpréndeme
      </button>
    </div>
  );
}

function LoadingState() {
  const messages = ["Consultando el menú...", "Pensando la recomendación...", "Casi listo..."];
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <Sparkles size={18} className="absolute inset-0 m-auto text-primary" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-white/50 text-sm"
        >
          {messages[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ result, onReset }) {
  const { product, reason } = result;

  const handleViewInMenu = () => {
    document
      .getElementById(product.category_slug)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-4 mt-2"
    >
      {/* Image */}
      {product.image_url && (
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Badge */}
      <span className="self-start px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold uppercase tracking-wide">
        {product.category}
      </span>

      {/* Product name */}
      <h3 className="text-2xl font-extrabold leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {product.name}
      </h3>

      {/* Description */}
      {product.description && (
        <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>
      )}

      {/* AI reason */}
      {reason && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-white/80 text-sm italic leading-relaxed">
            <Sparkles size={13} className="inline mr-1.5 text-primary" />
            {reason}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-1">
        <button
          onClick={handleViewInMenu}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-dark font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Ver en carta
          <ArrowRight size={15} />
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-white/60 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
          Intentar de nuevo
        </button>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DrinkRecommender() {
  const [tab, setTab] = useState("quiz");
  const [mood, setMood] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const audioRecorder = useAudioRecorder();

  React.useEffect(() => {
    if (audioRecorder.transcript) {
      setMood(audioRecorder.transcript.slice(0, 150));
    }
  }, [audioRecorder.transcript]);

  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    resetResult();
  };

  const handleMoodSubmit = async () => {
    if (mood.trim().length < 5) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${env.API_BASE_URL}${ENDPOINTS.AI_MOOD_RECOMMEND}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener recomendación");
      setResult(data);
    } catch (err) {
      setError(err.message || "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!QUIZ_QUESTIONS.every((q) => quizAnswers[q.key])) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${env.API_BASE_URL}${ENDPOINTS.AI_QUIZ_RECOMMEND}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: quizAnswers.temperature,
          taste: quizAnswers.taste,
          alcohol: quizAnswers.alcohol,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener recomendación");
      setResult(data);
    } catch (err) {
      setError(err.message || "Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      id="que-te-provoca"
      className="py-6 bg-dark"
    >
      <div className="container mx-auto px-4">
      <div className="max-w-xl mx-auto backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              ¿Qué te provoca hoy?
            </h2>
            <p className="text-white/40 text-xs">3 preguntas y encontramos tu bebida ideal</p>
          </div>
        </div>

        <TabSwitcher active={tab} onChange={handleTabChange} />

        {/* Content area */}
        {loading ? (
          <LoadingState />
        ) : result ? (
          <ResultCard result={result} onReset={resetResult} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "mood" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "mood" ? (
                <MoodTab
                  mood={mood}
                  onChange={setMood}
                  onSubmit={handleMoodSubmit}
                  loading={loading}
                  audio={audioRecorder}
                />
              ) : (
                <QuizTab
                  answers={quizAnswers}
                  onChange={(key, value) =>
                    setQuizAnswers((prev) => ({ ...prev, [key]: value }))
                  }
                  onSubmit={handleQuizSubmit}
                  loading={loading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Error */}
        {error && !loading && (
          <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
      </div>
    </motion.section>
  );
}
