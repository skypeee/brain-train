import { useEffect, useRef, useState, useCallback } from 'react';

export function useTimer(isRunning: boolean, initialElapsedMs?: number) {
  const initialElapsed = initialElapsedMs ?? 0;
  const [elapsed, setElapsed] = useState(initialElapsed);
  const startRef = useRef<number>(0);
  const accumRef = useRef<number>(initialElapsed);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialRef = useRef(initialElapsed);

  // Sync when initialElapsedMs changes externally
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
      intervalRef.current = setInterval(() => {
        setElapsed(accumRef.current + (Date.now() - startRef.current));
      }, 50);
    } else {
      accumRef.current = elapsed;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const setElapsedMs = useCallback((ms: number) => {
    accumRef.current = ms;
    initialRef.current = ms;
    startRef.current = Date.now();
    setElapsed(ms);
  }, []);

  const reset = useCallback(() => {
    setElapsedMs(0);
  }, [setElapsedMs]);

  return { elapsed, reset, setElapsed: setElapsedMs };
}
