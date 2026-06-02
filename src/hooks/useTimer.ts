import { useEffect, useRef, useState } from 'react';

export function useTimer(isRunning: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const accumRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

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

  const reset = () => {
    accumRef.current = 0;
    setElapsed(0);
  };

  return { elapsed, reset };
}
