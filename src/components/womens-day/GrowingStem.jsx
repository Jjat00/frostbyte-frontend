import React, { useEffect, useRef, useState } from "react";

const BLOOM_POINTS = [0.15, 0.35, 0.55, 0.75, 0.92];

const GrowingStem = () => {
  const canvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = 120;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stemHeight = canvas.height * scrollProgress;
      const centerX = 60;

      if (stemHeight < 5) return;

      // Draw stem with natural curve
      ctx.beginPath();
      ctx.moveTo(centerX, canvas.height);

      const segments = 60;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = canvas.height - t * stemHeight;
        const wave = Math.sin(t * Math.PI * 3) * 8 * t;
        ctx.lineTo(centerX + wave, y);
      }

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - stemHeight);
      gradient.addColorStop(0, "rgba(34, 120, 50, 0.9)");
      gradient.addColorStop(0.5, "rgba(50, 160, 70, 0.8)");
      gradient.addColorStop(1, "rgba(80, 180, 100, 0.6)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Draw thorns along the stem
      for (let i = 0; i < 12; i++) {
        const t = (i + 0.5) / 12;
        if (t > scrollProgress) continue;

        const y = canvas.height - t * stemHeight;
        const wave = Math.sin(t * Math.PI * 3) * 8 * t;
        const x = centerX + wave;
        const side = i % 2 === 0 ? 1 : -1;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + side * 6, y - 4);
        ctx.strokeStyle = "rgba(34, 100, 40, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw leaves
      const leafPositions = [0.2, 0.4, 0.6, 0.8];
      for (const lp of leafPositions) {
        if (lp > scrollProgress) continue;

        const leafProgress = Math.min((scrollProgress - lp) / 0.08, 1);
        const y = canvas.height - lp * stemHeight;
        const wave = Math.sin(lp * Math.PI * 3) * 8 * lp;
        const x = centerX + wave;
        const side = leafPositions.indexOf(lp) % 2 === 0 ? 1 : -1;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(leafProgress, leafProgress);

        // Leaf shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          side * 18, -8,
          side * 22, -16,
          side * 12, -22
        );
        ctx.bezierCurveTo(
          side * 6, -16,
          side * 4, -8,
          0, 0
        );
        ctx.fillStyle = "rgba(50, 160, 70, 0.5)";
        ctx.fill();

        // Leaf vein
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(side * 12, -10, side * 12, -20);
        ctx.strokeStyle = "rgba(34, 120, 50, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      // Draw roses at bloom points
      for (let bi = 0; bi < BLOOM_POINTS.length; bi++) {
        const bp = BLOOM_POINTS[bi];
        if (bp > scrollProgress) continue;

        const bloomProgress = Math.min((scrollProgress - bp) / 0.06, 1);
        const y = canvas.height - bp * stemHeight;
        const wave = Math.sin(bp * Math.PI * 3) * 8 * bp;
        const x = centerX + wave;

        drawRose(ctx, x, y, bloomProgress, bi);
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0 pointer-events-none z-40"
      style={{ height: "100vh", width: "120px" }}
    />
  );
};

function drawRose(ctx, cx, cy, progress, index) {
  const size = 12 * progress;
  if (size < 1) return;

  const roseColors = [
    ["#ff4070", "#ff6090", "#ff80a0"],
    ["#e8305a", "#ff5080", "#ff7098"],
    ["#ff5080", "#ff7098", "#ff90b0"],
    ["#d42050", "#e84070", "#ff6090"],
    ["#ff3068", "#ff5088", "#ff70a0"],
  ];

  const colors = roseColors[index % roseColors.length];

  ctx.save();
  ctx.translate(cx, cy);

  // Glow
  ctx.shadowColor = "rgba(255, 80, 120, 0.4)";
  ctx.shadowBlur = 10 * progress;

  // Outer petals (5 petals)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      size * 0.5, -size * 0.8,
      size * 0.8, -size * 0.4,
      0, -size
    );
    ctx.bezierCurveTo(
      -size * 0.8, -size * 0.4,
      -size * 0.5, -size * 0.8,
      0, 0
    );
    ctx.fillStyle = colors[0];
    ctx.globalAlpha = 0.7 * progress;
    ctx.fill();
    ctx.restore();
  }

  // Inner petals (4 petals, rotated)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      size * 0.3, -size * 0.5,
      size * 0.5, -size * 0.3,
      0, -size * 0.65
    );
    ctx.bezierCurveTo(
      -size * 0.5, -size * 0.3,
      -size * 0.3, -size * 0.5,
      0, 0
    );
    ctx.fillStyle = colors[1];
    ctx.globalAlpha = 0.8 * progress;
    ctx.fill();
    ctx.restore();
  }

  // Center
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = colors[2];
  ctx.globalAlpha = 0.9 * progress;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.restore();
}

export default GrowingStem;
