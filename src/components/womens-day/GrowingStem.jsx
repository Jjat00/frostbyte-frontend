import React, { useEffect, useRef, useState } from "react";

const BLOOM_POINTS = [0.12, 0.28, 0.44, 0.6, 0.76, 0.9];

const GrowingStem = () => {
  const canvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(Math.min(scrollTop / docHeight, 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = 100;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stemHeight = canvas.height * scrollProgress;
      const centerX = 40;
      if (stemHeight < 5) return;

      // Draw main stem with natural S-curve
      ctx.beginPath();
      ctx.moveTo(centerX, canvas.height);

      const segments = 80;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = canvas.height - t * stemHeight;
        const wave = Math.sin(t * Math.PI * 4) * 6 * t + Math.sin(t * Math.PI * 1.5) * 3;
        ctx.lineTo(centerX + wave, y);
      }

      const stemGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - stemHeight);
      stemGrad.addColorStop(0, "rgba(40, 100, 45, 0.85)");
      stemGrad.addColorStop(0.4, "rgba(55, 140, 60, 0.7)");
      stemGrad.addColorStop(0.8, "rgba(70, 160, 80, 0.55)");
      stemGrad.addColorStop(1, "rgba(90, 180, 100, 0.4)");

      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Small thorns
      for (let i = 0; i < 16; i++) {
        const t = (i + 0.5) / 16;
        if (t > scrollProgress) continue;
        const y = canvas.height - t * stemHeight;
        const wave = Math.sin(t * Math.PI * 4) * 6 * t + Math.sin(t * Math.PI * 1.5) * 3;
        const x = centerX + wave;
        const side = i % 2 === 0 ? 1 : -1;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + side * 4, y - 3);
        ctx.strokeStyle = "rgba(40, 90, 35, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Leaves - more positions, alternating sides
      const leafPositions = [0.08, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.88];
      for (let li = 0; li < leafPositions.length; li++) {
        const lp = leafPositions[li];
        if (lp > scrollProgress) continue;

        const leafProg = Math.min((scrollProgress - lp) / 0.06, 1);
        const y = canvas.height - lp * stemHeight;
        const wave = Math.sin(lp * Math.PI * 4) * 6 * lp + Math.sin(lp * Math.PI * 1.5) * 3;
        const x = centerX + wave;
        const side = li % 2 === 0 ? 1 : -1;
        const leafSize = 14 + Math.sin(li * 1.7) * 4;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(leafProg, leafProg);
        ctx.rotate(side * 0.2);

        // Leaf shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(side * leafSize * 0.8, -leafSize * 0.3, side * leafSize, -leafSize * 0.7, side * leafSize * 0.5, -leafSize);
        ctx.bezierCurveTo(side * leafSize * 0.2, -leafSize * 0.6, side * leafSize * 0.1, -leafSize * 0.3, 0, 0);

        const leafGrad = ctx.createLinearGradient(0, 0, side * leafSize * 0.5, -leafSize);
        leafGrad.addColorStop(0, "rgba(50, 140, 60, 0.5)");
        leafGrad.addColorStop(1, "rgba(80, 170, 90, 0.3)");
        ctx.fillStyle = leafGrad;
        ctx.fill();

        // Leaf vein
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(side * leafSize * 0.4, -leafSize * 0.4, side * leafSize * 0.5, -leafSize * 0.9);
        ctx.strokeStyle = "rgba(40, 100, 45, 0.3)";
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.restore();
      }

      // Roses and small flowers at bloom points
      for (let bi = 0; bi < BLOOM_POINTS.length; bi++) {
        const bp = BLOOM_POINTS[bi];
        if (bp > scrollProgress) continue;

        const bloomProg = Math.min((scrollProgress - bp) / 0.05, 1);
        const y = canvas.height - bp * stemHeight;
        const wave = Math.sin(bp * Math.PI * 4) * 6 * bp + Math.sin(bp * Math.PI * 1.5) * 3;
        const x = centerX + wave;

        if (bi % 3 === 0) {
          drawRose(ctx, x, y, bloomProg, bi);
        } else if (bi % 3 === 1) {
          drawSmallFlower(ctx, x, y, bloomProg);
        } else {
          drawBud(ctx, x, y, bloomProg);
        }
      }
    };

    draw();
    return () => window.removeEventListener("resize", resize);
  }, [scrollProgress, isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0 pointer-events-none z-40"
      style={{ height: "100vh", width: "100px" }}
    />
  );
};

function drawRose(ctx, cx, cy, progress, index) {
  const size = 11 * progress;
  if (size < 1) return;

  const palettes = [
    ["#e84080", "#ff6090", "#ff90b0"],
    ["#d42050", "#e84070", "#ff7098"],
    ["#ff3068", "#ff5088", "#ff80a0"],
  ];
  const colors = palettes[index % palettes.length];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = "rgba(255, 80, 120, 0.35)";
  ctx.shadowBlur = 8 * progress;

  // Outer petals
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i / 6) * Math.PI * 2 - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, -size * 0.75, size * 0.75, -size * 0.35, 0, -size);
    ctx.bezierCurveTo(-size * 0.75, -size * 0.35, -size * 0.5, -size * 0.75, 0, 0);
    ctx.fillStyle = colors[0];
    ctx.globalAlpha = 0.7 * progress;
    ctx.fill();
    ctx.restore();
  }

  // Inner petals
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i / 4) * Math.PI * 2 + 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.3, -size * 0.5, size * 0.5, -size * 0.25, 0, -size * 0.6);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.25, -size * 0.3, -size * 0.5, 0, 0);
    ctx.fillStyle = colors[1];
    ctx.globalAlpha = 0.8 * progress;
    ctx.fill();
    ctx.restore();
  }

  // Center
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = colors[2];
  ctx.globalAlpha = 0.9 * progress;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawSmallFlower(ctx, cx, cy, progress) {
  const size = 8 * progress;
  if (size < 1) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = "rgba(255, 180, 200, 0.3)";
  ctx.shadowBlur = 5 * progress;

  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.28, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffb0cc";
    ctx.globalAlpha = 0.7 * progress;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe8a0";
  ctx.globalAlpha = 0.9 * progress;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawBud(ctx, cx, cy, progress) {
  const size = 7 * progress;
  if (size < 1) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = 0.65 * progress;

  // Bud body
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e84080";
  ctx.fill();

  // Sepals
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.15);
  ctx.quadraticCurveTo(0, -size * 0.4, size * 0.25, size * 0.15);
  ctx.fillStyle = "rgba(60,140,70,0.5)";
  ctx.fill();

  ctx.restore();
}

export default GrowingStem;
