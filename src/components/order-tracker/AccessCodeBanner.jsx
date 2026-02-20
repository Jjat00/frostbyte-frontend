import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, Loader2, AlertCircle, Eye } from "lucide-react";

const AccessCodeBanner = ({ tableNumber, onVerified }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      const order = await publicOrdersService.verifyOrder(
        fullCode,
        tableNumber
      );
      onVerified(order, fullCode);
      setIsOpen(false);
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
    <div className="mx-4 md:mx-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full relative overflow-hidden rounded-xl border transition-all ${
          isOpen
            ? "bg-secondary/15 border-secondary/30"
            : "bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 border-secondary/20 hover:border-secondary/40"
        }`}
      >
        {/* Glow sutil */}
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 animate-pulse pointer-events-none" />
        )}

        <div className="relative flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-light">
                Seguí tu pedido en vivo
              </p>
              <p className="text-xs text-gray">
                Ingresá el código que te dio el mesero
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-secondary transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 space-y-3">
              <p className="text-xs text-gray text-center">
                Código de 4 dígitos
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                <div className="flex justify-center gap-3">
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
                      className="w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold bg-dark-secondary border-2 border-gray/20 rounded-xl text-light focus:border-secondary focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <div className="md:min-w-[140px]">
                  {error && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessCodeBanner;
