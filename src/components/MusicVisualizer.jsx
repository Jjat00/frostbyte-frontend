import React, { useRef, useEffect } from "react";

const MusicVisualizer = ({ isPlaying = false }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    shockwaves: [],
    mouse: { x: -9999, y: -9999, active: false },
    time: 0,
    energy: 0,
    rotY: 0,
    rotX: 0.3,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    const state = stateRef.current;

    const PARTICLE_COUNT = 1400;
    const BASE_RADIUS = 160;

    // Fibonacci sphere distribution - even coverage
    const initParticles = () => {
      const particles = [];
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2; // -1 to 1
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = goldenAngle * i;
        particles.push({
          // unit sphere coords
          sx: radiusAtY * Math.cos(theta),
          sy: y,
          sz: radiusAtY * Math.sin(theta),
          // current world position (set each frame)
          wx: 0, wy: 0, wz: 0,
          // screen position
          _x: 0, _y: 0, _depth: 0,
          // properties
          size: 0.4 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          freqBand: Math.abs(y), // 0=equator, 1=poles
          hueBase: Math.random() * 30 - 15,
        });
      }
      return particles;
    };

    state.particles = initParticles();

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
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
      state.shockwaves.push({ x, y, radius: 0, maxRadius: 400, speed: 5, life: 1 });
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
      const cx = w / 2;
      const cy = h / 2;
      const dt = 0.016;
      state.time += dt;

      // clear with trail
      ctx.fillStyle = "rgba(10, 10, 20, 0.2)";
      ctx.fillRect(0, 0, w, h);

      // energy transition
      const targetEnergy = isPlaying ? 1 : 0.05;
      state.energy = lerp(state.energy, targetEnergy, 0.02);
      const energy = state.energy;

      // rotation
      const rotSpeedBase = 0.15 + energy * 0.35;
      state.rotY += dt * rotSpeedBase;

      // subtle mouse-driven tilt
      if (state.mouse.active) {
        const targetRotX = 0.3 + ((state.mouse.y - cy) / h) * 0.4;
        state.rotX = lerp(state.rotX, targetRotX, 0.03);
      }

      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);
      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);

      // beat
      const bpm = 128;
      const beat = Math.pow(Math.sin(state.time * bpm / 60 * Math.PI) * 0.5 + 0.5, 4);

      // responsive sphere radius
      const minDim = Math.min(w, h);
      const sphereRadius = Math.min(BASE_RADIUS, minDim * 0.28);

      // breathing
      const breathe = 1 + beat * 0.12 * energy;

      // update shockwaves
      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.radius += sw.speed;
        sw.life = 1 - sw.radius / sw.maxRadius;
        if (sw.life <= 0) state.shockwaves.splice(i, 1);
      }

      // process particles
      for (const p of state.particles) {
        // frequency displacement: equator=bass(big), poles=treble(small)
        const freqSpeed = 1.5 + p.freqBand * 5;
        const freqAmp = (1 - p.freqBand * 0.6) * 0.15 * energy;
        const freqDisp = Math.sin(state.time * freqSpeed + p.phase) * freqAmp;
        const beatDisp = beat * 0.08 * (1 - p.freqBand * 0.4) * energy;

        const r = sphereRadius * breathe * (1 + freqDisp + beatDisp);

        // rotate: Y then X
        let x = p.sx, y = p.sy, z = p.sz;
        // rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        // rotate X
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        p.wx = x1 * r;
        p.wy = y1 * r;
        p.wz = z2 * r;

        // perspective projection
        const fov = 600;
        const zOff = p.wz + fov + sphereRadius;
        const scale = fov / Math.max(zOff, 1);
        p._x = cx + p.wx * scale;
        p._y = cy + p.wy * scale;
        p._depth = z2; // -1 (back) to 1 (front)

        // shockwave displacement
        for (const sw of state.shockwaves) {
          const dx = p._x - sw.x;
          const dy = p._y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const waveDist = Math.abs(dist - sw.radius);
          if (waveDist < 50 && dist > 0) {
            const force = (1 - waveDist / 50) * 20 * sw.life;
            p._x += (dx / dist) * force;
            p._y += (dy / dist) * force;
          }
        }

        // mouse repulsion
        if (state.mouse.active) {
          const dx = p._x - state.mouse.x;
          const dy = p._y - state.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (1 - dist / 120) * 25;
            p._x += (dx / dist) * force;
            p._y += (dy / dist) * force;
          }
        }
      }

      // sort by depth for painter's algo (back first)
      const sorted = [...state.particles].sort((a, b) => a._depth - b._depth);

      // draw particles
      for (const p of sorted) {
        const depthNorm = (p._depth + 1) / 2; // 0=back, 1=front

        // color: latitude-based hue, magenta(300) at equator -> cyan(190) at poles
        const latHue = 300 - p.freqBand * 110 + p.hueBase;
        // brightness based on depth + energy
        const baseBright = 25 + depthNorm * 35;
        const bright = baseBright + energy * 20 + beat * 10;
        const sat = 60 + energy * 35;

        // alpha: back particles very dim, front bright
        const depthAlpha = 0.08 + depthNorm * 0.65;
        const alpha = depthAlpha * (0.3 + energy * 0.7);

        // size: back smaller, front larger
        const depthSize = 0.3 + depthNorm * 0.7;
        const pSize = p.size * depthSize * (0.7 + energy * 0.5 + beat * 0.15);

        // glow only for front-facing bright particles
        if (depthNorm > 0.5 && energy > 0.2) {
          ctx.shadowBlur = 4 + depthNorm * 6 * energy;
          ctx.shadowColor = `hsla(${latHue}, ${sat}%, ${bright}%, ${alpha * 0.4})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `hsla(${latHue}, ${sat}%, ${bright}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p._x, p._y, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // atmosphere glow around sphere
      const glowAlpha = 0.04 + energy * 0.08 + beat * 0.03;
      const grad = ctx.createRadialGradient(cx, cy, sphereRadius * 0.5, cx, cy, sphereRadius * 1.8);
      grad.addColorStop(0, `rgba(255, 0, 212, ${glowAlpha})`);
      grad.addColorStop(0.5, `rgba(120, 0, 200, ${glowAlpha * 0.5})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

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
