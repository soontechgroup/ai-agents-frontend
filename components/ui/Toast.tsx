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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          container: 'border-green-400 bg-gradient-to-r from-green-600/30 to-green-500/20 text-green-100',
          icon: '✅',
          glow: 'shadow-[0_0_40px_rgba(34,197,94,0.5)]'
        };
      case 'error':
        return {
          container: 'border-red-400 bg-gradient-to-r from-red-500/20 to-red-400/10 text-white',
          icon: '❌',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
        };
      default:
        return {
          container: 'border-[var(--accent-primary)] bg-gradient-to-r from-[rgba(0,217,255,0.2)] to-[rgba(123,104,238,0.1)] text-white',
          icon: 'ℹ️',
          glow: 'shadow-[0_0_30px_rgba(0,217,255,0.3)]'
        };
    }
  };

  const styles = getTypeStyles(type);

  return (
    <div className="animate-in slide-in-from-top-2 duration-300">
      <div className={`
        min-w-[380px] max-w-[500px] px-6 py-4 rounded-xl border-2 backdrop-blur-xl
        flex items-start gap-4
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        ${styles.container} ${styles.glow}
        transform hover:scale-105 transition-all duration-200
      `}>
        <div className="text-2xl mt-0.5 flex-shrink-0">
          {styles.icon}
        </div>
        <div className="flex-1">
          <span className="text-base font-medium leading-relaxed">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition-opacity text-white hover:bg-white/10 rounded-lg p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}