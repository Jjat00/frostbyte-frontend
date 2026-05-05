import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Acento lateral: rosas pastel que florecen al hacer scroll.

const RoseSVG = ({ className, style }) => (
  <svg viewBox="0 0 60 60" className={className} style={style} fill="none">
    {[0, 72, 144, 216, 288].map((deg, i) => (
      <path
        key={`outer-${i}`}
        d="M30 30 C35 22, 40 26, 30 16 C20 26, 25 22, 30 30Z"
        fill={["#f48fb1", "#f8a5b8", "#e8a4b8", "#ffc8d9", "#ffb4cc"][i]}
        opacity={0.85}
        transform={`rotate(${deg} 30 30)`}
      />
    ))}
    {[0, 90, 180, 270].map((deg, i) => (
      <path
        key={`inner-${i}`}
        d="M30 30 C33 25, 35 27, 30 21 C25 27, 27 25, 30 30Z"
        fill="#ffd0e0"
        opacity={0.92}
        transform={`rotate(${deg} 30 30)`}
      />
    ))}
    <circle cx="30" cy="30" r="3" fill="#fff5e6" opacity={0.95} />
  </svg>
);

const roses = [
  { top: "18%", right: "3%", size: 40, delay: 0 },
  { top: "32%", right: "5%", size: 28, delay: 0.1 },
  { top: "48%", right: "2%", size: 35, delay: 0.2 },
  { top: "62%", right: "6%", size: 24, delay: 0.15 },
  { top: "78%", right: "3%", size: 32, delay: 0.25 },
];

const RoseScrollAccent = () => {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed right-0 top-0 h-screen w-20 pointer-events-none z-40 hidden md:block">
      <motion.div
        className="absolute right-6 top-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-700/40 to-transparent"
        style={{
          height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
        }}
      />

      {roses.map((rose, i) => {
        const threshold = (i + 1) / (roses.length + 1);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: rose.top,
              right: rose.right,
              opacity: useTransform(
                scrollYProgress,
                [threshold - 0.05, threshold, threshold + 0.05],
                [0, 1, 1]
              ),
              scale: useTransform(
                scrollYProgress,
                [threshold - 0.05, threshold + 0.03],
                [0.3, 1]
              ),
            }}
          >
            <RoseSVG
              className="drop-shadow-[0_0_8px_rgba(248,165,184,0.5)]"
              style={{
                width: rose.size,
                height: rose.size,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default RoseScrollAccent;
