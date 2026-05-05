import React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const messages = [
  { text: "Feliz Día Mamá", emoji: "🌷" },
  { text: "Te amo Mamá", emoji: "💐" },
  { text: "Mamá", emoji: "🌸" },
  { text: "Gracias Mamá", emoji: "🌺" },
  { text: "Madre", emoji: "🌹" },
  { text: "Día de la Madre", emoji: "💗" },
  { text: "Eres mi todo", emoji: "🌻" },
  { text: "Feliz Día", emoji: "🌷" },
  { text: "Mamá", emoji: "🌼" },
  { text: "Te amo Mamá", emoji: "💖" },
  { text: "Feliz Día Mamá", emoji: "🌺" },
  { text: "Madre", emoji: "🌷" },
];

const positions = [
  { top: "8%", left: "5%", rotate: -12, scale: 0.9, side: "left" },
  { top: "14%", left: "78%", rotate: 8, scale: 1.1, side: "right" },
  { top: "22%", left: "10%", rotate: -6, scale: 0.8, side: "left" },
  { top: "30%", left: "82%", rotate: 15, scale: 1.0, side: "right" },
  { top: "38%", left: "3%", rotate: -18, scale: 0.85, side: "left" },
  { top: "46%", left: "75%", rotate: 10, scale: 1.05, side: "right" },
  { top: "54%", left: "8%", rotate: -8, scale: 0.95, side: "left" },
  { top: "62%", left: "80%", rotate: 14, scale: 0.9, side: "right" },
  { top: "70%", left: "4%", rotate: -14, scale: 1.0, side: "left" },
  { top: "78%", left: "76%", rotate: 6, scale: 0.85, side: "right" },
  { top: "85%", left: "7%", rotate: -10, scale: 1.1, side: "left" },
  { top: "92%", left: "82%", rotate: 12, scale: 0.9, side: "right" },
];

const FloatingText = ({ message, position, index }) => {
  const { scrollYProgress } = useScroll();

  const threshold = (index + 0.5) / (messages.length + 1);

  const rawOpacity = useTransform(
    scrollYProgress,
    [threshold - 0.04, threshold, threshold + 0.02],
    [0, 1, 1]
  );
  const rawY = useTransform(
    scrollYProgress,
    [threshold - 0.04, threshold, threshold + 0.06],
    [60, 0, -8]
  );
  const rawRotate = useTransform(
    scrollYProgress,
    [threshold - 0.04, threshold, threshold + 0.08],
    [position.rotate + (position.side === "left" ? -25 : 25), position.rotate, position.rotate * 0.6]
  );
  const rawScale = useTransform(
    scrollYProgress,
    [threshold - 0.04, threshold, threshold + 0.03],
    [0.3, position.scale, position.scale]
  );

  const opacity = useSpring(rawOpacity, { stiffness: 120, damping: 14 });
  const y = useSpring(rawY, { stiffness: 80, damping: 8, mass: 1.2 });
  const rotate = useSpring(rawRotate, { stiffness: 60, damping: 6, mass: 1.5 });
  const scale = useSpring(rawScale, { stiffness: 150, damping: 10, mass: 0.8 });

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        top: position.top,
        left: position.left,
        opacity,
        y,
        rotate,
        scale,
      }}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-base sm:text-lg">{message.emoji}</span>
        <span
          className="text-sm sm:text-base font-bold whitespace-nowrap"
          style={{
            color: "rgba(244, 143, 177, 0.45)",
            textShadow: "0 0 12px rgba(248, 165, 184, 0.25)",
          }}
        >
          {message.text}
        </span>
      </div>
    </motion.div>
  );
};

const ScrollFelizDia = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {messages.map((msg, i) => (
        <FloatingText
          key={i}
          message={msg}
          position={positions[i]}
          index={i}
        />
      ))}
    </div>
  );
};

export default ScrollFelizDia;
