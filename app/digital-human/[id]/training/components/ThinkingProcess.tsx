'use client';

import { Brain, Zap, Database, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { ThinkingStep } from '@/lib/types/digital-human';

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  currentThinking?: string;
  isProcessing: boolean;
}

const stageIcons: Record<string, any> = {
  'intent_recognition': MessageSquare,
  'knowledge_extraction': Database,
  'context_analysis': Brain,
  'question_generation': Zap,
  'save_message': CheckCircle2,
};

const stageNames: Record<string, string> = {
  'intent_recognition': '意图识别',
  'knowledge_extraction': '知识提取',
  'context_analysis': '上下文分析',
  'question_generation': '问题生成',
  'save_message': '保存消息',
};

export default function ThinkingProcess({
  steps,
  currentThinking,
  isProcessing
}: ThinkingProcessProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/80">
        <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>ReAct 思考过程</span>
        </h2>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {!isProcessing && steps.length === 0 ? (
          // 等待状态
          <div className="text-center py-12">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-gray-500" />
              </div>
              {/* 神经连接动画 */}
              <div className="absolute -inset-2">
                <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                <div className="absolute bottom-4 right-3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-8 right-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-2 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              </div>
            </div>
            <p className="text-gray-400 text-sm">AI 思维待激活</p>
            <p className="text-gray-600 text-xs mt-1">开始对话后查看思考过程</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 当前思考状态 */}
            {isProcessing && currentThinking && (
              <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在分析</span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
                {currentThinking && (
                  <p className="text-gray-300 text-sm mt-2">{currentThinking}</p>
                )}
              </div>
            )}
            
            {/* 思考步骤列表 */}
            {steps.map((step, index) => {
              const Icon = stageIcons[step.stage] || Brain;
              const stageName = stageNames[step.stage] || step.stage;
              
              return (
                <div
                  key={`${step.stage}-${index}`}
                  className="px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-1">
                        {stageName}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {step.detail}
                      </p>
                      {step.timestamp && (
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(step.timestamp).toLocaleTimeString('zh-CN')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 底部提示 */}
      {isProcessing && (
        <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/80">
          <p className="text-xs text-gray-500 text-center">
            AI 正在深度分析和学习中...
          </p>
        </div>
      )}
    </div>
  );
}