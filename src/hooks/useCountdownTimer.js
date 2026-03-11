import { useState, useEffect, useRef, useCallback } from 'react';

export const useCountdownTimer = (durationSeconds, { onComplete, autoStart = false } = {}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [restartKey, setRestartKey] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, durationSeconds - elapsed);

    setTimeLeft(remaining);

    if (remaining <= 0) {
      setIsRunning(false);
      startTimeRef.current = null;
      onCompleteRef.current?.();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [durationSeconds]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning, restartKey, tick]);

  const start = useCallback(() => {
    setTimeLeft(durationSeconds);
    setIsRunning(true);
    setRestartKey((k) => k + 1);
  }, [durationSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(durationSeconds);
    startTimeRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [durationSeconds]);

  return {
    timeLeft: Math.ceil(timeLeft),
    isRunning,
    progress: durationSeconds > 0 ? timeLeft / durationSeconds : 0,
    start,
    pause,
    reset,
  };
};

export default useCountdownTimer;
