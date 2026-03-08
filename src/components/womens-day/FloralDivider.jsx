import React from "react";
import { motion } from "framer-motion";

// --- SVG Flower components ---

const RoseIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
      <path
        key={i}
        d="M12,12 C13.8,9 15.5,7.5 12,4.5 C8.5,7.5 10.2,9 12,12Z"
        fill={["#e84080", "#ff5090", "#d93670", "#ff4080", "#e84080", "#ff6098"][i]}
        opacity={0.8}
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
    {[45, 135, 225, 315].map((deg, i) => (
      <path
        key={`in-${i}`}
        d="M12,12 C13,10 14,9 12,6.5 C10,9 11,10 12,12Z"
        fill="#ff7098"
        opacity={0.9}
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
    <circle cx="12" cy="12" r="1.6" fill="#ffb0c8" />
  </svg>
);

const SmallFlowerIcon = ({ size = 22, color = "#ffb0cc" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    {[0, 72, 144, 216, 288].map((deg, i) => (
      <ellipse
        key={i}
        cx="10" cy="6"
        rx="2.8" ry="4"
        fill={color}
        opacity={0.8}
        transform={`rotate(${deg} 10 10)`}
      />
    ))}
    <circle cx="10" cy="10" r="2.2" fill="#ffe8a0" opacity="0.9" />
  </svg>
);

const DaisyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <ellipse
        key={i}
        cx="10" cy="5.5"
        rx="1.8" ry="3.5"
        fill="white"
        opacity={0.75}
        transform={`rotate(${deg} 10 10)`}
      />
    ))}
    <circle cx="10" cy="10" r="2.5" fill="#ffe060" opacity="0.9" />
  </svg>
);

const BudIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 14 18" fill="none">
    <ellipse cx="7" cy="7" rx="3.2" ry="5.5" fill="#e84080" opacity="0.65" />
    <path d="M4.5,13 Q7,5 9.5,13" fill="rgba(60,140,70,0.55)" />
    <path d="M5.2,13 Q7,6.5 8.8,13" fill="rgba(60,140,70,0.4)" />
  </svg>
);

const LeafIcon = ({ size = 18, flip = false }) => (
  <svg
    width={size} height={size} viewBox="0 0 16 20" fill="none"
    style={flip ? { transform: "scaleX(-1)" } : undefined}
  >
    <path
      d="M8,2 Q14,8 8,18 Q2,8 8,2Z"
      fill="rgba(60,150,70,0.45)"
      stroke="rgba(40,110,50,0.25)"
      strokeWidth="0.5"
    />
    <path d="M8,4 Q9,10 8,16" stroke="rgba(40,110,50,0.3)" strokeWidth="0.5" fill="none" />
  </svg>
);

// --- Variants: more flowers, denser ---

const dividerVariants = [
  [
    { type: "leaf", flip: false, y: -5 },
    { type: "rose", y: 4 },
    { type: "small", color: "#ffc0d8", y: -3 },
    { type: "leaf", flip: true, y: 5 },
    { type: "daisy", y: -4 },
    { type: "rose", y: 3 },
    { type: "leaf", flip: false, y: -2 },
    { type: "bud", y: 5 },
    { type: "small", y: -4 },
    { type: "leaf", flip: true, y: 3 },
    { type: "rose", y: -5 },
  ],
  [
    { type: "bud", y: 3 },
    { type: "leaf", flip: true, y: -4 },
    { type: "rose", y: 5 },
    { type: "daisy", y: -3 },
    { type: "leaf", flip: false, y: 4 },
    { type: "rose", y: -5 },
    { type: "small", color: "#ffd0e0", y: 3 },
    { type: "leaf", flip: true, y: -4 },
    { type: "bud", y: 5 },
    { type: "rose", y: -3 },
    { type: "leaf", flip: false, y: 4 },
  ],
  [
    { type: "small", color: "#ffd0e0", y: -3 },
    { type: "rose", y: 5 },
    { type: "leaf", flip: true, y: -4 },
    { type: "daisy", y: 3 },
    { type: "rose", y: -5 },
    { type: "leaf", flip: false, y: 4 },
    { type: "bud", y: -3 },
    { type: "rose", y: 5 },
    { type: "leaf", flip: true, y: -2 },
    { type: "small", y: 4 },
    { type: "leaf", flip: false, y: -4 },
  ],
  [
    { type: "leaf", flip: true, y: 3 },
    { type: "daisy", y: -5 },
    { type: "rose", y: 4 },
    { type: "leaf", flip: false, y: -3 },
    { type: "small", color: "#ffb8d0", y: 5 },
    { type: "rose", y: -4 },
    { type: "leaf", flip: true, y: 3 },
    { type: "bud", y: -5 },
    { type: "rose", y: 4 },
    { type: "daisy", y: -3 },
    { type: "leaf", flip: false, y: 5 },
  ],
  [
    { type: "rose", y: -4 },
    { type: "leaf", flip: false, y: 5 },
    { type: "bud", y: -3 },
    { type: "rose", y: 4 },
    { type: "daisy", y: -5 },
    { type: "leaf", flip: true, y: 3 },
    { type: "small", y: -4 },
    { type: "rose", y: 5 },
    { type: "leaf", flip: false, y: -3 },
    { type: "bud", y: 4 },
    { type: "rose", y: -5 },
  ],
  [
    { type: "daisy", y: 4 },
    { type: "rose", y: -5 },
    { type: "leaf", flip: true, y: 3 },
    { type: "small", color: "#ffc8e0", y: -4 },
    { type: "leaf", flip: false, y: 5 },
    { type: "rose", y: -3 },
    { type: "bud", y: 4 },
    { type: "leaf", flip: true, y: -5 },
    { type: "rose", y: 3 },
    { type: "small", y: -4 },
    { type: "daisy", y: 5 },
  ],
];

const renderElement = (el) => {
  switch (el.type) {
    case "rose": return <RoseIcon />;
    case "small": return <SmallFlowerIcon color={el.color} />;
    case "daisy": return <DaisyIcon />;
    case "bud": return <BudIcon />;
    case "leaf": return <LeafIcon flip={el.flip} />;
    default: return null;
  }
};

const FloralDivider = ({ variant = 0 }) => {
  const elements = dividerVariants[variant % dividerVariants.length];

  return (
    <div className="relative w-full py-4 sm:py-5 overflow-hidden">
      {/* Animated vine - thick and visible */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="-10 0 1020 60"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "100px" }}
        transition={{ duration: 0.5 }}
      >
        {/* Main vine */}
        <motion.path
          d="M-20,30 C125,8 125,52 250,30 C375,8 375,52 500,30 C625,8 625,52 750,30 C875,8 875,52 1020,30"
          stroke="rgba(50,120,55,0.35)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Secondary vine */}
        <motion.path
          d="M-20,32 C125,10 125,54 250,32 C375,10 375,54 500,32 C625,10 625,54 750,32 C875,10 875,54 1020,32"
          stroke="rgba(70,145,75,0.18)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.05 }}
        />
        {/* Subtle third vine for depth */}
        <motion.path
          d="M-20,28 C125,6 125,50 250,28 C375,6 375,50 500,28 C625,6 625,50 750,28 C875,6 875,50 1020,28"
          stroke="rgba(80,160,85,0.1)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.1 }}
        />
      </motion.svg>

      {/* Flower elements - edge to edge */}
      <div className="relative flex items-center justify-between">
        {elements.map((el, i) => (
          <motion.div
            key={i}
            // On mobile hide every 3rd leaf to avoid overcrowding but keep all flowers
            className={
              el.type === "leaf" && i % 4 === 0 ? "hidden sm:block" : ""
            }
            style={{ transform: `translateY(${el.y}px)` }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "80px" }}
            transition={{
              delay: 0.15 + i * 0.06,
              type: "spring",
              stiffness: 250,
              damping: 12,
            }}
          >
            {renderElement(el)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FloralDivider;
