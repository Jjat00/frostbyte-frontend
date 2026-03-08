import React, { useEffect, useRef } from "react";

const PETAL_COUNT = 25;
const COLORS = [
  "rgba(255, 105, 135, 0.7)",
  "rgba(255, 150, 170, 0.6)",
  "rgba(255, 80, 120, 0.5)",
  "rgba(255, 180, 195, 0.5)",
  "rgba(220, 60, 100, 0.4)",
];

const FloatingPetals = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;

    const petals = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize petals
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 8 + Math.random() * 14,
        speedY: 0.3 + Math.random() * 0.8,
        speedX: -0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.4 + Math.random() * 0.5,
      });
    }

    const drawPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      // Draw a petal shape
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(
        p.size * 0.6, -p.size * 0.6,
        p.size * 0.5, p.size * 0.3,
        0, p.size * 0.5
      );
      ctx.bezierCurveTo(
        -p.size * 0.5, p.size * 0.3,
        -p.size * 0.6, -p.size * 0.6,
        0, -p.size
      );
      ctx.fillStyle = p.color;
      ctx.fill();

      // Subtle vein line
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.quadraticCurveTo(p.size * 0.1, 0, 0, p.size * 0.4);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of petals) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobblePhase) * 0.5;
        p.rotation += p.rotationSpeed;
        p.wobblePhase += p.wobbleSpeed;

        // Reset petal when it falls off screen
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        drawPetal(p);
      }

      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 0.6 }}
    />
  );
};

export default FloatingPetals;
