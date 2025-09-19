'use client';

import { useEffect } from 'react';
import { XCircle } from 'lucide-react';

export default function TrainingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Training Mode Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center max-w-md">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-white">训练模式启动失败</h2>
        <p className="text-gray-400 mb-6">
          {error.message || '训练系统暂时不可用，请稍后重试'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
          >
            重新启动
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            返回聊天
          </button>
        </div>
      </div>
    </div>
  );
}