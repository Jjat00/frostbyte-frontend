import React, { useEffect, useRef } from "react";

const PETAL_COLORS = [
  "#ff6b8a", "#ff8fa8", "#ff4d73", "#ffb3c6",
  "#e84080", "#ffc2d4", "#ff97b7", "#d94070",
];
const FLOWER_COLORS = ["#ffb0cc", "#ffc8db", "#ff90b8", "#ffd0e0"];

const FloatingPetals = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    let windPhase = 0;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 12 : 20;

    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Types: 0=rose petal, 1=cherry blossom petal, 2=small flower, 3=tiny leaf
    for (let i = 0; i < COUNT; i++) {
      const r = Math.random();
      const type = r < 0.35 ? 0 : r < 0.6 ? 1 : r < 0.82 ? 2 : 3;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 1.5 - canvas.height * 0.5,
        size: type === 2 ? 5 + Math.random() * 7 : 7 + Math.random() * 10,
        type,
        speedY: 0.15 + Math.random() * 0.45,
        speedX: -0.1 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.006 + Math.random() * 0.012,
        wobbleAmp: 0.3 + Math.random() * 0.6,
        color:
          type === 2
            ? FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]
            : type === 3
              ? `rgba(${70 + Math.random() * 40},${130 + Math.random() * 40},${60 + Math.random() * 30},0.45)`
              : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        opacity: 0.25 + Math.random() * 0.35,
      });
    }

    // --- Draw functions ---

    const drawRosePetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(
        p.size * 0.7, -p.size * 0.65,
        p.size * 0.55, p.size * 0.25,
        0, p.size * 0.5
      );
      ctx.bezierCurveTo(
        -p.size * 0.55, p.size * 0.25,
        -p.size * 0.7, -p.size * 0.65,
        0, -p.size
      );
      ctx.fillStyle = p.color;
      ctx.fill();

      // Subtle highlight curve
      ctx.beginPath();
      ctx.moveTo(p.size * 0.08, -p.size * 0.7);
      ctx.quadraticCurveTo(p.size * 0.2, -p.size * 0.1, 0, p.size * 0.2);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    };

    const drawCherryPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      // Rounder petal with slight notch at tip
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.bezierCurveTo(
        p.size * 0.75, -p.size * 0.55,
        p.size * 0.65, p.size * 0.15,
        p.size * 0.12, p.size * 0.4
      );
      ctx.quadraticCurveTo(0, p.size * 0.28, -p.size * 0.12, p.size * 0.4);
      ctx.bezierCurveTo(
        -p.size * 0.65, p.size * 0.15,
        -p.size * 0.75, -p.size * 0.55,
        0, -p.size * 0.8
      );
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    };

    const drawSmallFlower = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      const n = 5;
      for (let i = 0; i < n; i++) {
        ctx.save();
        ctx.rotate((i / n) * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, -p.size * 0.4, p.size * 0.22, p.size * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      // center
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,230,180,0.8)";
      ctx.fill();

      ctx.restore();
    };

    const drawTinyLeaf = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.55);
      ctx.bezierCurveTo(
        p.size * 0.35, -p.size * 0.25,
        p.size * 0.25, p.size * 0.2,
        0, p.size * 0.55
      );
      ctx.bezierCurveTo(
        -p.size * 0.25, p.size * 0.2,
        -p.size * 0.35, -p.size * 0.25,
        0, -p.size * 0.55
      );
      ctx.fillStyle = p.color;
      ctx.fill();

      // vein
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.45);
      ctx.lineTo(0, p.size * 0.45);
      ctx.strokeStyle = "rgba(40,100,40,0.25)";
      ctx.lineWidth = 0.4;
      ctx.stroke();

      ctx.restore();
    };

    const drawFns = [drawRosePetal, drawCherryPetal, drawSmallFlower, drawTinyLeaf];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      windPhase += 0.002;
      const wind = Math.sin(windPhase) * 0.12 + Math.sin(windPhase * 2.7) * 0.06;

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobblePhase) * p.wobbleAmp + wind;
        p.rotation += p.rotationSpeed;
        p.wobblePhase += p.wobbleSpeed;

        if (p.y > canvas.height + 30) {
          p.y = -30;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;

        drawFns[p.type](p);
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
      className="fixed inset-0 pointer-events-none z-30"
      style={{ opacity: 0.5 }}
    />
  );
};

export default FloatingPetals;
