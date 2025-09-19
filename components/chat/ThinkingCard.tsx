'use client';

import { useState, useEffect } from 'react';
import { Brain, ChevronDown, ChevronUp, Cpu, Loader2, Zap, CheckCircle } from 'lucide-react';

interface ThinkingCardProps {
  content: string;
  metadata?: {
    stage?: string;
    detail?: string;
    messageType?: string;
    originalData?: any;
    [key: string]: any;
  };
  timestamp?: string;
}

export default function ThinkingCard({ content, metadata, timestamp }: ThinkingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dots, setDots] = useState('');

  // 动态省略号效果
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 解析思考数据
  let stage = '思考中';
  let detail = content;
  let steps: string[] = [];
  let progress = 0;

  if (metadata?.originalData) {
    const data = metadata.originalData;
    stage = data.stage || data.phase || data.step || '思考中';
    detail = data.detail || data.description || data.content || content;

    // 获取思考步骤
    if (data.steps && Array.isArray(data.steps)) {
      steps = data.steps;
      progress = (data.current_step / data.total_steps) * 100 || 0;
    } else if (data.thoughts && Array.isArray(data.thoughts)) {
      steps = data.thoughts;
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-cyan-500/20 rounded animate-pulse">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-medium text-cyan-300">思考过程</div>
          <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
        </div>
        <div className="text-sm text-gray-300 mb-2">
          {stage}{dots}
        </div>
        {steps.length > 0 && (
          <div className="space-y-1 mb-2">
            {steps.slice(0, isExpanded ? steps.length : 2).map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
        {progress > 0 && (
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg group-hover:bg-cyan-500/15 transition-colors">
          <span className="text-xs text-cyan-400">
            {isExpanded ? '收起' : '查看详情'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
          )}
        </div>
      </button>

      {isExpanded && detail && (
        <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {detail}
          </div>
          {steps.length > 2 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-2">完整思考步骤:</div>
              <div className="space-y-1">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}