import { useCallback, useEffect, useRef, useState } from "react";

export function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop(); // 중복 실행 방지
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setSeconds(initialSeconds);
  }, [initialSeconds, stop]);

  // 언마운트 시 interval 정리
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { seconds, start, stop, reset };
}
