'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatTopbar from '@/components/chat/ChatTopbar';
import ChatDialogue from '@/components/chat/ChatDialogue';
import ChatInput from '@/components/chat/ChatInput';
import { DigitalHuman } from '@/lib/types/digital-human';
import { useToast } from '@/lib/hooks/useToast';
import { digitalHumanService } from '@/lib/api/services/digital-human.service';
import { useConversation } from '@/lib/hooks/useConversation';
import { Message } from '@/lib/types/conversation';

export default function DigitalHumanChatPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const [digitalHuman, setDigitalHuman] = useState<DigitalHuman | null>(null);
  const [sessionStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;
  const numericId = parseInt(id);

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
    autoCreate: false
  });

  const messages = conversationMessages;

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    const loadDigitalHuman = async () => {
      setIsLoading(true);
      
      try {
        const digitalHumanData = await digitalHumanService.getDigitalHuman(numericId);

        if (!isMounted) {
          return;
        }

        
        if (digitalHumanData && digitalHumanData.id) {
          setDigitalHuman(digitalHumanData);
          setIsLoading(false);
        } else {
          showToast({
            message: '无法加载数字人信息，即将返回首页',
            type: 'error'
          });
          redirectTimeout = setTimeout(() => {
            if (isMounted) {
              router.push('/');
            }
          }, 2000);
        }
      } catch (error: any) {
        if (!isMounted) {
          return;
        }

        const errorMessage = error?.response?.data?.message || error?.message || '加载数字人失败';

        if (error?.response?.status === 404) {
          const is404Message = errorMessage.includes('不存在') || errorMessage.includes('无权访问');
          if (is404Message) {
            showToast({
              message: '该数字人不存在或您没有访问权限，即将返回首页',
              type: 'error'
            });
          } else {
            showToast({
              message: errorMessage + '，即将返回首页',
              type: 'error'
            });
          }
        } else {
          showToast({
            message: errorMessage + '，即将返回首页',
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

    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [numericId]);

  useEffect(() => {
    if (digitalHuman && !conversation && !isConversationLoading) {
      createConversation();
    }
  }, [digitalHuman, conversation, isConversationLoading, createConversation]);

  const sendMessage = async (content: string) => {
    if (!digitalHuman) {
      showToast({
        message: '数字人未加载，请刷新页面重试',
        type: 'error'
      });
      return;
    }

    if (conversationError) {
      clearError();
    }

    await sendConversationMessage(content);

    if (conversationError) {
      showToast({
        message: conversationError,
        type: 'error'
      });
    }
  };



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

      <ChatSidebar
        digitalHuman={digitalHuman}
      />

      <main className="flex-1 flex flex-col relative z-10">
        <ChatTopbar
          digitalHuman={digitalHuman}
          sessionStartTime={sessionStartTime}
          onBack={() => router.back()}
        />

        <ChatDialogue
          messages={messages}
          isThinking={isThinking}
          digitalHumanAvatar={digitalHuman.avatar || '🎙️'}
        />

        <ChatInput
          onSendMessage={sendMessage}
          isDisabled={!conversation || isConversationLoading}
          isSending={isThinking}
        />
      </main>

      <ToastContainer />
    </div>
  );
}