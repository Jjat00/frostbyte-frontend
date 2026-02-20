import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, Loader2, AlertCircle } from "lucide-react";

const AccessCodeBanner = ({ tableNumber, onVerified }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    // Solo permitir alfanuméricos
    const char = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError("");

    // Auto-focus al siguiente input
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
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
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
      setError("Ingresa el código de 4 caracteres");
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

  // Auto-submit when all 4 chars entered
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
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-secondary/10 border border-secondary/20 rounded-xl hover:bg-secondary/15 transition-all"
      >
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-light">
            ¿Tienes un código de pedido?
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
            <div className="pt-3 pb-1 space-y-3">
              <p className="text-xs text-gray text-center">
                Ingresa el código que te dio el mesero
              </p>

              {/* 4 digit inputs */}
              <div className="flex justify-center gap-3">
                {code.map((char, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold bg-dark-secondary border-2 border-gray/20 rounded-xl text-light focus:border-secondary focus:outline-none transition-colors uppercase"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center justify-center gap-1 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessCodeBanner;
