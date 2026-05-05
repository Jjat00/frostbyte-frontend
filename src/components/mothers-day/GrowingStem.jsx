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
      stemGrad.addColorStop(0, "rgba(60, 120, 60, 0.85)");
      stemGrad.addColorStop(0.4, "rgba(80, 150, 80, 0.7)");
      stemGrad.addColorStop(0.8, "rgba(100, 170, 100, 0.55)");
      stemGrad.addColorStop(1, "rgba(130, 190, 130, 0.4)");

      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Hojas
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

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(side * leafSize * 0.8, -leafSize * 0.3, side * leafSize, -leafSize * 0.7, side * leafSize * 0.5, -leafSize);
        ctx.bezierCurveTo(side * leafSize * 0.2, -leafSize * 0.6, side * leafSize * 0.1, -leafSize * 0.3, 0, 0);

        const leafGrad = ctx.createLinearGradient(0, 0, side * leafSize * 0.5, -leafSize);
        leafGrad.addColorStop(0, "rgba(70, 150, 80, 0.55)");
        leafGrad.addColorStop(1, "rgba(110, 180, 110, 0.35)");
        ctx.fillStyle = leafGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(side * leafSize * 0.4, -leafSize * 0.4, side * leafSize * 0.5, -leafSize * 0.9);
        ctx.strokeStyle = "rgba(60, 120, 60, 0.35)";
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.restore();
      }

      // Flores en puntos de floración
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

  // Paletas pastel cálidas
  const palettes = [
    ["#f48fb1", "#f8a5b8", "#ffd0e0"],
    ["#e8a4b8", "#ffb4cc", "#ffe4cc"],
    ["#fbd5e1", "#ffc8d9", "#fff5e6"],
  ];
  const colors = palettes[index % palettes.length];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = "rgba(248, 165, 184, 0.4)";
  ctx.shadowBlur = 8 * progress;

  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i / 6) * Math.PI * 2 - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.5, -size * 0.75, size * 0.75, -size * 0.35, 0, -size);
    ctx.bezierCurveTo(-size * 0.75, -size * 0.35, -size * 0.5, -size * 0.75, 0, 0);
    ctx.fillStyle = colors[0];
    ctx.globalAlpha = 0.8 * progress;
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i / 4) * Math.PI * 2 + 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.3, -size * 0.5, size * 0.5, -size * 0.25, 0, -size * 0.6);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.25, -size * 0.3, -size * 0.5, 0, 0);
    ctx.fillStyle = colors[1];
    ctx.globalAlpha = 0.85 * progress;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = colors[2];
  ctx.globalAlpha = 0.95 * progress;
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
  ctx.shadowColor = "rgba(255, 200, 170, 0.35)";
  ctx.shadowBlur = 5 * progress;

  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.28, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd0c0";
    ctx.globalAlpha = 0.8 * progress;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#e8c896";
  ctx.globalAlpha = 0.95 * progress;
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
  ctx.globalAlpha = 0.7 * progress;

  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#f48fb1";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.15);
  ctx.quadraticCurveTo(0, -size * 0.4, size * 0.25, size * 0.15);
  ctx.fillStyle = "rgba(100,160,90,0.55)";
  ctx.fill();

  ctx.restore();
}

export default GrowingStem;
