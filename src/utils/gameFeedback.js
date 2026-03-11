const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const getCtx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
};

const vibrate = (pattern) => {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Vibration not available
  }
};

// Reveal role - suspenseful rising tone
export const feedbackReveal = () => {
  playTone(300, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(500, 0.15, 'sine', 0.25), 120);
  setTimeout(() => playTone(700, 0.3, 'sine', 0.3), 240);
  vibrate([50, 30, 100]);
};

// Impostor reveal - dramatic low tone
export const feedbackImpostor = () => {
  playTone(150, 0.4, 'sawtooth', 0.2);
  setTimeout(() => playTone(120, 0.5, 'sawtooth', 0.25), 300);
  vibrate([100, 50, 200]);
};

// Next turn - soft click
export const feedbackNextTurn = () => {
  playTone(800, 0.08, 'sine', 0.15);
  vibrate(30);
};

// Vote confirm - firm tap
export const feedbackVote = () => {
  playTone(600, 0.1, 'square', 0.15);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.2), 100);
  vibrate([40, 20, 40]);
};

// Phase transition - whoosh
export const feedbackPhaseChange = () => {
  playTone(400, 0.2, 'sine', 0.15);
  setTimeout(() => playTone(600, 0.25, 'sine', 0.2), 150);
  vibrate([30, 20, 60]);
};

// Timer warning - urgent beep
export const feedbackTimerWarning = () => {
  playTone(1000, 0.08, 'square', 0.2);
  vibrate(50);
};

// Game over - fanfare
export const feedbackGameOver = () => {
  playTone(523, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 150);
  setTimeout(() => playTone(784, 0.3, 'sine', 0.25), 300);
  vibrate([50, 30, 50, 30, 100]);
};
