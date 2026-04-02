import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Radio } from "lucide-react";

const AccessCodeBanner = ({ tableNumber, onVerified }) => {
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
      const order = await publicOrdersService.verifyOrder(fullCode, tableNumber);
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
      className="w-full bg-gradient-to-r from-secondary/8 via-dark-secondary to-primary/8 border-y border-secondary/20"
    >
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-5 md:gap-12">

          {/* Info: icono + títulos */}
          <div className="flex items-center gap-3 md:flex-shrink-0">
            <div className="relative w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-secondary" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-light leading-tight">
                Mirá tu pedido y lo que vas consumiendo
              </p>
              <p className="text-xs text-secondary/70 mt-0.5">
                Seguí en vivo el estado y te avisamos cuando esté listo
              </p>
            </div>
          </div>

          {/* Divisor visible solo en desktop */}
          <div className="hidden md:block w-px h-10 bg-white/10 flex-shrink-0" />

          {/* Inputs + feedback */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <p className="text-xs text-white/40">
                Código del mesero
              </p>
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
                    className="w-12 h-13 text-center text-xl font-bold bg-dark border-2 border-white/15 rounded-xl text-light focus:border-secondary focus:outline-none transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Estado: error / loading */}
            <div className="h-8 flex items-center">
              {error && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-secondary text-xs">
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
