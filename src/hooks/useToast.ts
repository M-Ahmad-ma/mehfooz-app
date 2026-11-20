import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastTone = 'success' | 'warning' | 'neutral';

export type ToastState = {
  text: string;
  tone: ToastTone;
};

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback((text: string, tone: ToastTone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ text, tone });
    timer.current = setTimeout(() => {
      setToast(null);
      timer.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { toast, show, dismiss };
}
