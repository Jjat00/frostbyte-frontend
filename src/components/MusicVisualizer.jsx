import React, { useRef, useEffect } from "react";

const MusicVisualizer = ({ isPlaying = false }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    rings: [],
    shockwaves: [],
    mouse: { x: -9999, y: -9999, active: false },
    time: 0,
    energy: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    const state = stateRef.current;

    const initRings = (w, h) => {
      const cx = w / 2, cy = h / 2;
      const minDim = Math.min(w, h);
      const rings = [];
      const ringCount = 6;
      for (let r = 0; r < ringCount; r++) {
        const radius = 60 + (r / (ringCount - 1)) * (minDim * 0.35 - 60);
        const particleCount = 35 + r * 5;
        const direction = r % 2 === 0 ? 1 : -1;
        const speed = (0.15 + (ringCount - r) * 0.05) * direction;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          particles.push({
            homeAngle: angle,
            currentAngle: angle,
            homeRadius: radius,
            currentRadius: radius,
            radialOffset: 0,
            size: 2 + Math.random(),
            phase: Math.random() * Math.PI * 2,
          });
        }
        rings.push({ radius, particles, speed, direction, ringIndex: r });
      }
      return rings;
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      state.rings = initRings(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
      state.mouse.active = true;
    };
    const handleTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        state.mouse.x = t.clientX - rect.left;
        state.mouse.y = t.clientY - rect.top;
        state.mouse.active = true;
      }
    };
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.changedTouches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.changedTouches?.[0]?.clientY) - rect.top;
      state.shockwaves.push({ x, y, radius: 0, maxRadius: 350, speed: 6, strength: 40, life: 1 });
    };
    const handleLeave = () => { state.mouse.active = false; };

    const parent = canvas.parentElement;
    parent.addEventListener("mousemove", handleMouse);
    parent.addEventListener("touchmove", handleTouch, { passive: true });
    parent.addEventListener("click", handleClick);
    parent.addEventListener("touchstart", handleClick, { passive: true });
    parent.addEventListener("mouseleave", handleLeave);
    parent.addEventListener("touchend", handleLeave);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2, cy = h / 2;
      state.time += 0.016;

      // fade
      ctx.fillStyle = "rgba(10, 10, 20, 0.18)";
      ctx.fillRect(0, 0, w, h);

      const targetEnergy = isPlaying ? 1 : 0.08;
      state.energy = lerp(state.energy, targetEnergy, 0.025);
      const energy = state.energy;

      const bpm = 128;
      const beat = Math.pow(Math.sin(state.time * bpm / 60 * Math.PI) * 0.5 + 0.5, 3);

      // update shockwaves
      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.radius += sw.speed;
        sw.life = 1 - sw.radius / sw.maxRadius;
        if (sw.life <= 0) { state.shockwaves.splice(i, 1); }
      }

      // central hub
      const hubRadius = 25 + beat * 15 * energy;
      const hubHue = 300 - beat * 120; // magenta -> cyan on beat
      const hubGlow = 20 + beat * 30 * energy;
      ctx.shadowBlur = hubGlow;
      ctx.shadowColor = `hsla(${hubHue}, 90%, 60%, ${0.4 + energy * 0.4})`;
      ctx.fillStyle = `hsla(${hubHue}, 80%, 50%, ${0.15 + energy * 0.25})`;
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
      ctx.fill();
      // hub ring
      ctx.strokeStyle = `hsla(${hubHue}, 90%, 60%, ${0.3 + energy * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // draw rings
      const ringCount = state.rings.length;
      for (const ring of state.rings) {
        const { particles, speed, ringIndex } = ring;
        const ringNorm = ringIndex / (ringCount - 1);
        // ring color: inner=magenta(300), outer=cyan(180)
        const ringHue = 300 - ringNorm * 120;

        // rotate
        const rotSpeed = speed * (0.2 + energy * 0.8);

        for (const p of particles) {
          p.currentAngle = p.homeAngle + state.time * rotSpeed;

          // frequency simulation - inner=bass(slow,big), outer=treble(fast,small)
          const freqSpeed = 1.5 + ringNorm * 4;
          const freqAmp = (40 - ringNorm * 25) * energy;
          const freq = Math.sin(state.time * freqSpeed + p.homeAngle * 3 + p.phase) * freqAmp;
          const beatDisp = beat * 20 * (1 - ringNorm * 0.5) * energy;
          let targetRadialOffset = freq + beatDisp;

          // mouse gravity
          const px = cx + Math.cos(p.currentAngle) * (p.homeRadius + p.radialOffset);
          const py = cy + Math.sin(p.currentAngle) * (p.homeRadius + p.radialOffset);
          if (state.mouse.active) {
            const dx = state.mouse.x - px;
            const dy = state.mouse.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && dist > 0) {
              const force = (1 - dist / 200) * 50;
              // pull toward mouse = reduce radius if mouse is inside, increase if outside
              const mouseDist = Math.sqrt((state.mouse.x - cx) ** 2 + (state.mouse.y - cy) ** 2);
              const particleDist = p.homeRadius + p.radialOffset;
              targetRadialOffset += (mouseDist - particleDist) * force * 0.02;
            }
          }

          // shockwave
          for (const sw of state.shockwaves) {
            const dx = px - sw.x;
            const dy = py - sw.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const waveDist = Math.abs(dist - sw.radius);
            if (waveDist < 40) {
              const waveForce = (1 - waveDist / 40) * sw.strength * sw.life;
              targetRadialOffset += waveForce;
            }
          }

          p.radialOffset = lerp(p.radialOffset, targetRadialOffset, 0.1);
          p.currentRadius = p.homeRadius + p.radialOffset;

          // position
          p._x = cx + Math.cos(p.currentAngle) * p.currentRadius;
          p._y = cy + Math.sin(p.currentAngle) * p.currentRadius;
        }

        // draw connections
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          const b = particles[(i + 1) % particles.length];
          const dist = Math.sqrt((a._x - b._x) ** 2 + (a._y - b._y) ** 2);
          const alpha = Math.max(0, (1 - dist / 100)) * (0.15 + energy * 0.35);
          ctx.shadowBlur = 4 + energy * 6;
          ctx.shadowColor = `hsla(${ringHue}, 80%, 60%, ${alpha * 0.5})`;
          ctx.strokeStyle = `hsla(${ringHue}, 80%, 55%, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a._x, a._y);
          ctx.lineTo(b._x, b._y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // draw particles
        for (const p of particles) {
          const displacement = Math.abs(p.radialOffset);
          const bright = 40 + displacement * 0.5 + beat * 15;
          const alpha = 0.4 + energy * 0.4 + displacement * 0.005;
          const size = p.size * (0.7 + energy * 0.3 + displacement * 0.02);

          ctx.shadowBlur = 6 + displacement * 0.2;
          ctx.shadowColor = `hsla(${ringHue}, 85%, ${bright}%, 0.5)`;
          ctx.fillStyle = `hsla(${ringHue}, 85%, ${bright}%, ${Math.min(alpha, 1)})`;
          ctx.beginPath();
          ctx.arc(p._x, p._y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // inter-ring connections (faint)
      if (energy > 0.3) {
        ctx.lineWidth = 0.3;
        for (let r = 0; r < state.rings.length - 1; r++) {
          const ringA = state.rings[r];
          const ringB = state.rings[r + 1];
          const step = Math.max(1, Math.floor(ringA.particles.length / 12));
          for (let i = 0; i < ringA.particles.length; i += step) {
            const pA = ringA.particles[i];
            // find closest in next ring
            let closest = ringB.particles[0];
            let minD = Infinity;
            for (const pB of ringB.particles) {
              const d = Math.sqrt((pA._x - pB._x) ** 2 + (pA._y - pB._y) ** 2);
              if (d < minD) { minD = d; closest = pB; }
            }
            if (minD < 80) {
              const alpha = (1 - minD / 80) * 0.1 * energy;
              ctx.strokeStyle = `rgba(200, 150, 255, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(pA._x, pA._y);
              ctx.lineTo(closest._x, closest._y);
              ctx.stroke();
            }
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", handleMouse);
      parent.removeEventListener("touchmove", handleTouch);
      parent.removeEventListener("click", handleClick);
      parent.removeEventListener("touchstart", handleClick);
      parent.removeEventListener("mouseleave", handleLeave);
      parent.removeEventListener("touchend", handleLeave);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default MusicVisualizer;
