'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatTopbar from '@/components/chat/ChatTopbar';
import ChatDialogue from '@/components/chat/ChatDialogue';
import ChatInput from '@/components/chat/ChatInput';
import { DigitalHuman, ChatMessage } from '@/lib/types/digital-human';
import { useToast } from '@/lib/hooks/useToast';
import { digitalHumanService } from '@/lib/api/services/digital-human.service';

export default function DigitalHumanChatPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  
  // 改进 ID 解析，添加验证
  const id = params.id as string;
  const numericId = parseInt(id);
  
  // 调试日志
  console.log('[DigitalHumanChat] Navigating to digital human:', { id, numericId });
  
  // 验证 ID 是否有效
  if (!id || isNaN(numericId)) {
    showToast({ 
      message: '无效的数字人 ID', 
      type: 'error' 
    });
    router.push('/');
    return null;
  }

  // 状态管理
  const [digitalHuman, setDigitalHuman] = useState<DigitalHuman | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(1); // 包含欢迎消息
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化数字人信息和欢迎消息
  useEffect(() => {
    const loadDigitalHuman = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[DigitalHumanChat] Loading digital human with ID:', numericId);
        const response = await digitalHumanService.getDigitalHuman(numericId);
        if (response.success && response.data) {
          console.log('[DigitalHumanChat] Digital human loaded successfully:', response.data);
          setDigitalHuman(response.data);
          
          // 添加欢迎消息
          setMessages([{
            id: '1',
            type: 'ai',
            content: `嗨，你好！我是${response.data.name}。\n\n${response.data.short_description || response.data.detailed_description || '很高兴与你对话！有什么我可以帮助你的吗？'}`,
            timestamp: new Date()
          }]);

          // 获取推荐话题
          try {
            const topicsResponse = await digitalHumanService.getRecommendedTopics(numericId);
            if (topicsResponse.success && topicsResponse.data) {
              setDigitalHuman(prev => prev ? {
                ...prev,
                topics: topicsResponse.data?.map(topic => topic.text)
              } : null);
            }
          } catch (error) {
            // 静默处理推荐话题获取失败
          }
          
          setIsLoading(false);
        } else {
          const errorMessage = response.message || '获取数字人信息失败';
          setError(errorMessage);
          showToast({
            message: errorMessage,
            type: 'error'
          });
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (error: any) {
        console.error('[DigitalHumanChat] Failed to load digital human:', error);
        const errorMessage = error?.response?.data?.message || error?.message || '加载数字人失败';
        
        // 特殊处理 404 错误
        if (error?.response?.status === 404) {
          const is404Message = errorMessage.includes('不存在') || errorMessage.includes('无权访问');
          if (is404Message) {
            setError('该数字人不存在或您没有访问权限');
            showToast({
              message: '该数字人不存在或您没有访问权限，即将返回首页',
              type: 'warning'
            });
          }
        } else {
          setError(errorMessage);
          showToast({
            message: errorMessage,
            type: 'error'
          });
        }
        
        setTimeout(() => router.push('/'), 2000);
      }
    };

    loadDigitalHuman();
  }, [numericId, router, showToast]);

  // 发送消息
  const sendMessage = async (content: string, isVoice: boolean = false) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    setIsThinking(true);

    try {
      const response = await digitalHumanService.sendMessage(numericId, {
        message: content,
        isVoice
      });

      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          id: response.data.messageId,
          type: 'ai',
          content: response.data.reply,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setMessageCount(prev => prev + 1);
      } else {
        showToast({
          message: '发送消息失败',
          type: 'error'
        });
      }
    } catch (error) {
      showToast({
        message: '发送消息失败',
        type: 'error'
      });
    } finally {
      setIsThinking(false);
    }
  };

  // 使用推荐话题
  const useTopic = (topic: string) => {
    sendMessage(topic);
  };

  // 切换收藏状态
  const toggleFavorite = () => {
    showToast({
      message: '收藏功能暂未开放，敬请期待',
      type: 'info'
    });
  };

  // 分享功能
  const shareChat = () => {
    showToast({
      message: '分享功能暂未开放，敬请期待',
      type: 'info'
    });
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
          <p className="mt-4 text-[var(--text-secondary)]">正在加载数字人信息...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">加载失败</h2>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <p className="text-sm text-[var(--text-muted)]">即将返回上一页...</p>
        </div>
      </div>
    );
  }

  // 数据未找到
  if (!digitalHuman) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">数字人不存在</h2>
          <p className="text-[var(--text-secondary)]">该数字人可能已被删除或不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative">
      {/* 网格背景 */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 侧边栏 */}
      <ChatSidebar 
        digitalHuman={digitalHuman}
        onUseTopic={useTopic}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* 顶部栏 */}
        <ChatTopbar
          digitalHuman={digitalHuman}
          sessionStartTime={sessionStartTime}
          messageCount={messageCount}
          isFavorited={isFavorited}
          onBack={() => router.back()}
          onToggleFavorite={toggleFavorite}
          onShare={shareChat}
        />

        {/* 对话区域 */}
        <ChatDialogue
          messages={messages}
          isThinking={isThinking}
        />

        {/* 输入区域 */}
        <ChatInput
          onSendMessage={sendMessage}
        />
      </main>

      {/* Toast容器 */}
      <ToastContainer />
    </div>
  );
}