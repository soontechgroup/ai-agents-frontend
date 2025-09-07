'use client';

import { TrainingProgress } from '@/lib/types/digital-human';

interface TrainingProgressBarProps {
  progress: TrainingProgress;
}

export default function TrainingProgressBar({ progress }: TrainingProgressBarProps) {
  const qualityColors = {
    excellent: 'text-green-400 border-green-400/30 bg-green-400/10',
    good: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    average: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    poor: 'text-red-400 border-red-400/30 bg-red-400/10'
  };

  const qualityLabels = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    poor: '较差'
  };

  return (
    <div className="flex items-center gap-6">
      {/* 对话轮次 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">对话轮次:</span>
        <span className="text-sm font-medium text-cyan-400">{progress.conversationRounds}</span>
      </div>
      
      {/* 有效训练 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">有效训练:</span>
        <span className="text-sm font-medium text-green-400">{progress.effectiveTraining}</span>
      </div>
      
      {/* 训练质量 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">训练质量:</span>
        <span className={`text-sm font-medium px-2 py-0.5 rounded border ${qualityColors[progress.trainingQuality]}`}>
          {qualityLabels[progress.trainingQuality]}
        </span>
      </div>
      
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">进度:</span>
        <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500 relative"
            style={{ width: `${progress.progressPercentage}%` }}
          >
            {/* 光晕效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-300">
          {Math.round(progress.progressPercentage)}%
        </span>
      </div>
    </div>
  );
}