'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatTopbar from '@/components/chat/ChatTopbar';
import ChatDialogue from '@/components/chat/ChatDialogue';
import ChatInput from '@/components/chat/ChatInput';
import { DigitalHuman, ChatMessage } from '@/lib/types/digital-human';
import { useToast } from '@/lib/hooks/useToast';
import { digitalHumanService } from '@/lib/api/services/digital-human.service';
import { useConversation } from '@/lib/hooks/useConversation';
import { Message } from '@/lib/types/conversation';

export default function DigitalHumanChatPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  
  // 状态管理 - 必须在任何条件返回之前声明所有Hooks
  const [digitalHuman, setDigitalHuman] = useState<DigitalHuman | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 改进 ID 解析，添加验证
  const id = params.id as string;
  const numericId = parseInt(id);
  const isValidId = id && !isNaN(numericId);
  
  // 使用会话管理Hook
  const {
    conversation,
    messages: conversationMessages,
    isLoading: isConversationLoading,
    isThinking,
    error: conversationError,
    sendMessage: sendConversationMessage,
    clearError,
    createConversation
  } = useConversation({
    digitalHumanId: numericId,
    autoCreate: false // 手动控制会话创建时机
  });
  
  // 转换消息格式
  const messages: ChatMessage[] = conversationMessages.map(msg => ({
    id: msg.id.toString(),
    type: msg.role === 'user' ? 'user' : 'ai',
    content: msg.content,
    timestamp: new Date(msg.created_at)
  }));
  
  const messageCount = messages.length;
  
  // 合并ID验证和数据加载的逻辑，避免重复执行
  useEffect(() => {
    // 使用标志位防止重复跳转
    let redirectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    // 无效ID直接处理
    if (!isValidId) {
      showToast({ 
        message: '无效的数字人 ID', 
        type: 'error' 
      });
      redirectTimeout = setTimeout(() => {
        if (isMounted) {
          router.push('/');
        }
      }, 1000);
      return;
    }

    // 加载数字人数据
    const loadDigitalHuman = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const digitalHumanData = await digitalHumanService.getDigitalHuman(numericId);
        
        // 检查组件是否还挂载
        if (!isMounted) {
          return;
        }

        
        if (digitalHumanData && digitalHumanData.id) {
          setDigitalHuman(digitalHumanData);
          setIsLoading(false);
        } else {
          setError('无法加载数字人信息');
          showToast({
            message: '无法加载数字人信息',
            type: 'error'
          });
          redirectTimeout = setTimeout(() => {
            if (isMounted) {
              router.push('/');
            }
          }, 2000);
        }
      } catch (error: any) {
        // 检查组件是否还挂载
        if (!isMounted) {
          return;
        }

        const errorMessage = error?.response?.data?.message || error?.message || '加载数字人失败';
        
        // 特殊处理 404 错误
        if (error?.response?.status === 404) {
          const is404Message = errorMessage.includes('不存在') || errorMessage.includes('无权访问');
          if (is404Message) {
            setError('该数字人不存在或您没有访问权限');
            showToast({
              message: '该数字人不存在或您没有访问权限，即将返回首页',
              type: 'error'
            });
          }
        } else {
          setError(errorMessage);
          showToast({
            message: errorMessage,
            type: 'error'
          });
        }
        
        redirectTimeout = setTimeout(() => {
          if (isMounted) {
            router.push('/');
          }
        }, 2000);
      }
    };

    loadDigitalHuman();

    // Cleanup 函数
    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [numericId, isValidId]); // 只依赖于稳定的值，移除 router 和 showToast
  
  // 数字人加载成功后，创建会话
  useEffect(() => {
    if (digitalHuman && !conversation && !isConversationLoading) {
      // 使用 Hook 提供的 createConversation 方法，确保状态同步
      createConversation();
    }
  }, [digitalHuman, conversation, isConversationLoading, createConversation]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!conversation) {
      showToast({
        message: '会话未初始化，请刷新页面重试',
        type: 'error'
      });
      return;
    }
    
    // 清除之前的错误
    if (conversationError) {
      clearError();
    }
    
    // 使用会话管理Hook发送消息
    await sendConversationMessage(content);
    
    // 如果发送失败，显示错误提示
    if (conversationError) {
      showToast({
        message: conversationError,
        type: 'error'
      });
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

  // 无效ID检查
  if (!isValidId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">无效的数字人ID，正在跳转...</p>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading || (digitalHuman && !conversation && isConversationLoading)) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
          <p className="mt-4 text-[var(--text-secondary)]">
            {isLoading ? '正在加载数字人信息...' : '正在初始化会话...'}
          </p>
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
        currentConversation={conversation}
        onUseTopic={useTopic}
        onNewConversation={async () => {
          // 创建新会话
          const { conversationService } = await import('@/lib/api/services/conversation.service');
          try {
            const response = await conversationService.createConversation({
              digital_human_id: digitalHuman.id,
              title: `与${digitalHuman.name}的新对话`
            });
            if (response.data) {
              // 刷新页面以加载新会话
              window.location.reload();
            }
          } catch (error) {
            showToast({
              message: '创建新会话失败',
              type: 'error'
            });
          }
        }}
        onSelectConversation={() => {
          // 切换会话 - 暂时通过刷新页面实现
          showToast({
            message: '会话切换功能即将推出',
            type: 'info'
          });
        }}
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
          isDisabled={!conversation || isConversationLoading}
          isSending={isThinking}
        />
      </main>

      {/* Toast容器 */}
      <ToastContainer />
    </div>
  );
}