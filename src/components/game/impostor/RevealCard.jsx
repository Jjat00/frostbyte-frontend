import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertTriangle, Shield } from 'lucide-react';

const RevealCard = ({ role, word, trapWord, category, hintEnabled, trapWordEnabled, spyTarget, onDone }) => {
  const [revealed, setRevealed] = useState(false);

  const isImpostor = role === 'impostor';
  const isSpy = role === 'spy';

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleDone = () => {
    setRevealed(false);
    onDone();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button
            key="hidden"
            initial={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
            onClick={handleReveal}
            className="w-72 h-96 rounded-3xl bg-gradient-to-br from-dark-secondary to-dark border-2 border-gray/30 flex flex-col items-center justify-center gap-4 shadow-2xl cursor-pointer active:scale-95 transition-transform"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gray/10 flex items-center justify-center"
            >
              <EyeOff className="w-10 h-10 text-gray/40" />
            </motion.div>
            <p className="text-gray/50 text-lg font-medium">Toca para revelar</p>
            <div className="text-6xl opacity-30">?</div>
          </motion.button>
        ) : (
          <motion.div
            key="revealed"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-72 h-96 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden ${
              isImpostor
                ? 'bg-gradient-to-br from-red-950 to-dark border-red-500/50'
                : isSpy
                ? 'bg-gradient-to-br from-purple-950 to-dark border-purple-500/50'
                : 'bg-gradient-to-br from-emerald-950 to-dark border-emerald-500/50'
            }`}
          >
            {/* Glow effect */}
            <div
              className={`absolute inset-0 opacity-20 ${
                isImpostor
                  ? 'bg-gradient-radial from-red-500 to-transparent'
                  : isSpy
                  ? 'bg-gradient-radial from-purple-500 to-transparent'
                  : 'bg-gradient-radial from-emerald-500 to-transparent'
              }`}
            />

            <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
              {isImpostor ? (
                <>
                  <AlertTriangle className="w-14 h-14 text-red-400" />
                  <h2 className="text-2xl font-bold text-red-400">IMPOSTOR</h2>
                  {trapWordEnabled && trapWord ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-300/60">Tu palabra es:</p>
                      <p className="text-3xl font-bold text-red-200">{trapWord}</p>
                    </div>
                  ) : hintEnabled && category ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-300/60">Pista - Categoría:</p>
                      <p className="text-2xl font-bold text-red-200">{category}</p>
                    </div>
                  ) : (
                    <p className="text-lg text-red-300/60">
                      No tienes pistas. Intenta pasar desapercibido.
                    </p>
                  )}
                </>
              ) : isSpy ? (
                <>
                  <Shield className="w-14 h-14 text-purple-400" />
                  <h2 className="text-2xl font-bold text-purple-400">ESPÍA</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-purple-300/60">La palabra es:</p>
                    <p className="text-3xl font-bold text-purple-200">{word}</p>
                  </div>
                  {spyTarget && (
                    <div className="mt-2 px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                      <p className="text-sm text-purple-300">
                        El impostor es: <span className="font-bold">{spyTarget}</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Eye className="w-14 h-14 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-emerald-400">CIUDADANO</h2>
                  <div className="space-y-2">
                    <p className="text-sm text-emerald-300/60">La palabra es:</p>
                    <p className="text-3xl font-bold text-emerald-200">{word}</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleDone}
          className="px-8 py-3 bg-secondary/20 border border-secondary/40 rounded-xl text-secondary font-bold text-lg hover:bg-secondary/30 transition-colors"
        >
          Entendido, pasar celular
        </motion.button>
      )}
    </div>
  );
};

export default RevealCard;
