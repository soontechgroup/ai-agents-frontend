'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MemoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Memory Viewer Error:', error);
  }, [error]);

  return (
    <div className="h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">记忆系统加载失败</h2>
        <p className="text-gray-400 mb-6">
          {error.message || '无法连接到记忆网络，请检查网络连接'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
          >
            重新加载
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}