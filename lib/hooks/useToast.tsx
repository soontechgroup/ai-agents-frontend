'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps } from '@/components/ui/Toast';

type ShowToastOptions = Omit<ToastProps, 'onClose'>;

export function useToast() {
  const [toasts, setToasts] = useState<(ShowToastOptions & { id: number })[]>([]);

  const showToast = useCallback((options: ShowToastOptions | string) => {
    const toastOptions = typeof options === 'string' 
      ? { message: options } 
      : options;
    
    const id = Date.now();
    setToasts(prev => [...prev, { ...toastOptions, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = () => {
    if (typeof window === 'undefined') return null;
    
    return createPortal(
      <>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ top: `${(index + 1) * 60}px` }}
            className="fixed right-4 z-50"
          >
            <Toast
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </>,
      document.body
    );
  };

  return { showToast, ToastContainer };
}