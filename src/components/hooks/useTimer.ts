import { useCallback, useEffect, useRef, useState } from "react";

export function useTimer(initialSeconds: number, onComplete?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // onComplete 참조를 최신 상태로 유지
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    stop(); // 중복 시작 방지
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          stop();
          // 타이머 완료 시 콜백 호출
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
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

  useEffect(() => {
    return () => stop(); // 언마운트 시 정리
  }, [stop]);

  return { seconds, isRunning, start, stop, reset };
}
