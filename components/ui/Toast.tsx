'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'border-green-500 bg-green-500/10 text-green-400',
    error: 'border-red-500 bg-red-500/10 text-red-400',
    info: 'border-[var(--accent-primary)] bg-[rgba(0,217,255,0.1)] text-[var(--text-primary)]'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fadeIn">
      <div className={`
        min-w-[300px] px-4 py-3 rounded-lg border backdrop-blur-xl
        flex items-center justify-between gap-3
        shadow-[0_10px_40px_rgba(0,0,0,0.5)]
        ${typeStyles[type]}
      `}>
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}