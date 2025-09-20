'use client';

import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ThinkingBubble from './ThinkingBubble';
import MemoryCard from './MemoryCard';
import ThinkingCard from './ThinkingCard';
import KnowledgeCard from './KnowledgeCard';
import { Message } from '@/lib/types/conversation';

interface ChatDialogueProps {
  messages: Message[];
  isThinking: boolean;
  digitalHumanAvatar?: string;
  streamingMessageId?: string | number; // 正在流式更新的消息ID
}

export default function ChatDialogue({ messages, isThinking, digitalHumanAvatar, streamingMessageId }: ChatDialogueProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-12 py-8 space-y-6 scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent"
      >
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isStreaming = isThinking && isLastMessage && message.role === 'assistant' && message.content !== '';

          // 根据消息类型或metadata中的messageType渲染不同组件
          const messageType = message.type || message.metadata?.messageType || 'text';

          // 检查是否有特殊类型内容
          let specialContent = null;

          // 首先检查是否有 memory 字段（不管消息类型）
          if (message.memory) {
            specialContent = (
              <MemoryCard
                content={message.content}
                memory={message.memory}
                timestamp={message.created_at}
              />
            );
          } else if (messageType === 'thinking') {
            specialContent = (
              <ThinkingCard
                content={message.content}
                metadata={message.metadata}
                timestamp={message.created_at}
              />
            );
          } else if (messageType === 'knowledge') {
            specialContent = (
              <KnowledgeCard
                content={message.content}
                metadata={message.metadata}
                timestamp={message.created_at}
              />
            );
          }

          // 转换Message到ChatMessage格式
          const chatMessage = {
            id: String(message.id),
            type: message.role === 'user' ? 'user' as const : 'ai' as const,
            content: message.content,
            timestamp: message.created_at ? new Date(message.created_at) : new Date(),
            specialContent,
            metadata: message.metadata  // 传递 metadata 信息
          };

          return (
            <ChatMessage
              key={message.id}
              message={chatMessage}
              digitalHumanAvatar={digitalHumanAvatar}
              isStreaming={isStreaming}
            />
          );
        })}
        
        {isThinking && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <ThinkingBubble digitalHumanAvatar={digitalHumanAvatar} />
        )}
      </div>
    </div>
  );
}