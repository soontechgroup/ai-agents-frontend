'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Brain, MessageSquare, Sparkles, Activity } from 'lucide-react';
import { DigitalHuman, TrainingMessage, TrainingEvent, ThinkingStep, TrainingProgress } from '@/lib/types/digital-human';
import { digitalHumanService } from '@/lib/api/services/digital-human.service';
import { useToast } from '@/lib/hooks/useToast';
import TrainingChat from './components/TrainingChat';
import ThinkingProcess from './components/ThinkingProcess';
import TrainingProgressBar from './components/TrainingProgressBar';

export default function DigitalHumanTrainingPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  
  const [digitalHuman, setDigitalHuman] = useState<DigitalHuman | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [messages, setMessages] = useState<TrainingMessage[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [currentThinking, setCurrentThinking] = useState<string>('');
  const [progress, setProgress] = useState<TrainingProgress>({
    conversationRounds: 0,
    effectiveTraining: 0,
    trainingQuality: 'average',
    progressPercentage: 0
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const id = params.id as string;
  const numericId = parseInt(id);

  // 加载数字人信息
  useEffect(() => {
    const loadDigitalHuman = async () => {
      if (!id || isNaN(numericId)) {
        showToast('无效的数字人ID', 'error');
        router.push('/');
        return;
      }

      try {
        setIsLoading(true);
        const data = await digitalHumanService.getDigitalHuman(numericId);
        setDigitalHuman(data);
        
        // 添加初始系统消息
        setMessages([{
          id: 'system-1',
          role: 'assistant',
          content: '训练已开始。请开始与数字人对话，通过纠正和引导来帮助它学习。每个高质量的对话都会提升训练效果。',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('加载数字人失败:', error);
        showToast('加载数字人信息失败', 'error');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadDigitalHuman();
  }, [id, numericId, router, showToast]);

  // 清理事件源
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 处理训练事件
  const handleTrainingEvent = (event: TrainingEvent) => {
    switch (event.type) {
      case 'user_message':
        // 用户消息已经在发送时添加
        break;
        
      case 'assistant_question':
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: event.data,
          timestamp: new Date()
        }]);
        setIsTraining(false);
        break;
        
      case 'thinking':
        setCurrentThinking(event.data || '');
        break;
        
      case 'node_start':
        setThinkingSteps(prev => [...prev, {
          stage: event.node || '未知阶段',
          detail: event.message || '',
          timestamp: event.timestamp
        }]);
        break;
        
      case 'node_complete':
        // 更新最后一个思考步骤的状态
        setThinkingSteps(prev => {
          const steps = [...prev];
          if (steps.length > 0) {
            const lastStep = steps[steps.length - 1];
            if (lastStep.stage === event.node) {
              lastStep.detail = event.message || lastStep.detail;
            }
          }
          return steps;
        });
        break;
        
      case 'knowledge_extracted':
        // 可以在这里显示知识提取的可视化
        if (event.data && Array.isArray(event.data)) {
          const entityCount = event.data.length;
          showToast(`提取了 ${entityCount} 个知识点`, 'success');
        }
        break;
        
      case 'error':
        showToast(event.data || '训练过程出现错误', 'error');
        setIsTraining(false);
        break;
    }
    
    // 更新进度
    updateProgress();
  };

  // 更新训练进度
  const updateProgress = () => {
    setProgress(prev => {
      const rounds = Math.floor(messages.filter(m => m.role === 'user').length);
      const effective = Math.floor(rounds * 0.7); // 假设70%的对话是有效的
      const percentage = Math.min((rounds / 30) * 100, 90); // 最多到90%
      
      let quality: TrainingProgress['trainingQuality'] = 'average';
      if (percentage > 70) quality = 'excellent';
      else if (percentage > 40) quality = 'good';
      else if (percentage < 20) quality = 'poor';
      
      return {
        conversationRounds: rounds,
        effectiveTraining: effective,
        trainingQuality: quality,
        progressPercentage: percentage
      };
    });
  };

  // 发送训练消息
  const handleSendMessage = async (message: string) => {
    if (!digitalHuman || isTraining) return;
    
    // 添加用户消息
    const userMessage: TrainingMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 清空之前的思考步骤
    setThinkingSteps([]);
    setCurrentThinking('');
    setIsTraining(true);
    
    try {
      // 调用训练接口
      await digitalHumanService.trainDigitalHuman(
        numericId,
        message,
        handleTrainingEvent,
        (error) => {
          console.error('训练错误:', error);
          showToast('训练过程出现错误', 'error');
          setIsTraining(false);
        },
        () => {
          setIsTraining(false);
        }
      );
    } catch (error) {
      console.error('发送训练消息失败:', error);
      showToast('发送消息失败', 'error');
      setIsTraining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!digitalHuman) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-400">数字人不存在</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* 顶部栏 */}
      <header className="h-16 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center px-6 gap-4">
        <button
          onClick={() => router.push(`/digital-human/${id}`)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <div className="flex items-center gap-3 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <Brain className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-sm font-medium text-gray-200">{digitalHuman.name}</div>
            <div className="text-xs text-gray-400">训练模式</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg">
          <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-sm text-gray-300">训练进行中</span>
        </div>
        
        <div className="flex-1" />
        
        <TrainingProgressBar progress={progress} />
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧聊天区域 */}
        <div className="flex-1 flex flex-col border-r border-gray-700/50">
          {/* 训练提示 */}
          <div className="px-6 py-4 bg-purple-500/10 border-b border-gray-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-400">训练模式已开启</h3>
            </div>
            <p className="text-xs text-gray-400">
              请通过对话来训练你的数字人。每次对话都会帮助它更好地理解和学习你期望的行为模式。
            </p>
          </div>
          
          {/* 聊天组件 */}
          <TrainingChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isTraining={isTraining}
            digitalHuman={digitalHuman}
          />
        </div>
        
        {/* 右侧思考过程 */}
        <aside className="w-96 bg-gray-800/50">
          <ThinkingProcess
            steps={thinkingSteps}
            currentThinking={currentThinking}
            isProcessing={isTraining}
          />
        </aside>
      </main>
      
      <ToastContainer />
    </div>
  );
}