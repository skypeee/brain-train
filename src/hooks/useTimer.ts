import { useEffect, useRef, useState } from 'react';

export function useTimer(isRunning: boolean, initialElapsedMs?: number) {
  const initialElapsed = initialElapsedMs ?? 0;
  const [elapsed, setElapsed] = useState(initialElapsed);
  const startRef = useRef<number>(0);
  const accumRef = useRef<number>(initialElapsed);
  const rafRef = useRef<number>(0);
  const initialRef = useRef(initialElapsed);

  useEffect(() => {
    if (initialElapsedMs === undefined) return;
    if (initialRef.current === initialElapsedMs) return;
    initialRef.current = initialElapsedMs;
    accumRef.current = initialElapsedMs;
    setElapsed(initialElapsedMs);
  }, [initialElapsedMs]);

  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now();
      const tick = () => {
        setElapsed(accumRef.current + (Date.now() - startRef.current));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      accumRef.current = elapsed;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning]);

  const setElapsedMs = (ms: number) => {
    accumRef.current = ms;
    initialRef.current = ms;
    startRef.current = Date.now();
    setElapsed(ms);
  };

  const reset = () => {
    setElapsedMs(0);
  };

  return { elapsed, reset, setElapsed: setElapsedMs };
}
