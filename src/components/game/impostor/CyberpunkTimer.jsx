import React from 'react';
import { motion } from 'framer-motion';

const CyberpunkTimer = ({ timeLeft, duration, size = 120 }) => {
  const progress = duration > 0 ? timeLeft / duration : 0;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const isWarning = timeLeft <= 5 && timeLeft > 0;

  const color = isWarning ? '#ef4444' : '#00e0ff';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1b1f3b"
          strokeWidth="6"
        />
        {/* Progreso */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <motion.div
        className="absolute text-3xl font-bold"
        style={{ color }}
        animate={isWarning ? { scale: [1, 1.2, 1] } : {}}
        transition={isWarning ? { duration: 0.5, repeat: Infinity } : {}}
      >
        {timeLeft}
      </motion.div>
    </div>
  );
};

export default CyberpunkTimer;
