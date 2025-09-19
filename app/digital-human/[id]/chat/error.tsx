'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function DigitalHumanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Digital Human Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">加载数字人时出错</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          {error.message || '发生了意外错误，请稍后重试'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}