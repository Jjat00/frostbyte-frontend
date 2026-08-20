import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Radio } from "lucide-react";

const AccessCodeBanner = ({ onVerified }) => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError("");

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 4);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length > 0) {
      const focusIdx = Math.min(pasted.length, 3);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 4) {
      setError("Ingresa el código de 4 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { publicOrdersService } = await import(
        "@/services/publicOrders.service"
      );
      const order = await publicOrdersService.verifyOrder(fullCode);
      onVerified(order, fullCode);
    } catch (err) {
      setError(err.message || "Código incorrecto");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 4) {
      handleSubmit();
    }
  }, [code]);

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="fb-section fb-section--plain w-full border-y border-white/[0.06]"
    >
      <div className="container relative z-10 mx-auto px-5 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-5 md:gap-12">

          {/* Info: icono + títulos */}
          <div className="flex items-center gap-3 md:flex-shrink-0">
            <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-secondary/20 bg-secondary/10">
              <Radio className="h-[18px] w-[18px] text-secondary" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-secondary" />
            </span>
            <div>
              <p className="text-[0.82rem] font-medium leading-tight text-light">
                Mira tu pedido y lo que vas consumiendo
              </p>
              <p className="mt-1 text-[0.7rem] text-light/45">
                Sigue el estado en vivo y te avisamos cuando esté listo
              </p>
            </div>
          </div>

          {/* Divisor visible solo en desktop */}
          <div className="hidden h-10 w-px flex-shrink-0 bg-white/[0.08] md:block" />

          {/* Inputs + feedback */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <p className="fb-eyebrow">Código del mesero</p>
              <div className="flex gap-2.5">
                {code.map((char, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="h-12 w-11 rounded-xl border border-white/[0.12] bg-white/[0.03] text-center text-lg font-medium text-light transition-colors focus:border-secondary/50 focus:outline-none disabled:opacity-50"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Estado: error / loading */}
            <div className="h-8 flex items-center">
              {error && (
                <div className="flex items-center gap-1.5 text-[0.7rem] text-light/70">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-[0.7rem] text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
};

export default AccessCodeBanner;
