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
  const prevMessageCountRef = useRef(0);
  const isStreamingRef = useRef(false);

  // 优化的自动滚动逻辑
  useEffect(() => {
    if (!scrollRef.current) return;

    // 检查是否是新消息（消息数量增加）
    const isNewMessage = messages.length > prevMessageCountRef.current;

    // 检查是否从非思考状态变为思考状态（新对话开始）
    const startedThinking = isThinking && !isStreamingRef.current;

    // 检查是否已经滚动到底部（容差10px）
    const isAtBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 10;

    // 只在新消息、开始思考或已在底部时滚动
    if ((isNewMessage || startedThinking || isAtBottom)) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }

    prevMessageCountRef.current = messages.length;
    isStreamingRef.current = isThinking;
  }, [messages, isThinking]); // 监听整个messages数组变化以便在流式更新时也能滚动

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-12 py-8 scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent"
      >
        <div className="flex flex-col justify-end min-h-full space-y-6">
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
    </div>
  );
}