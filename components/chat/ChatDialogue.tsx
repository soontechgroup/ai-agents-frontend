'use client';

import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ThinkingBubble from './ThinkingBubble';
import { ChatMessage as ChatMessageType } from '@/lib/types/digital-human';

interface ChatDialogueProps {
  messages: ChatMessageType[];
  isThinking: boolean;
  digitalHumanAvatar?: string;
  streamingMessageId?: string; // 正在流式更新的消息ID
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
          const isStreaming = isThinking && isLastMessage && message.type === 'ai' && message.content !== '';
          
          return (
            <ChatMessage 
              key={message.id} 
              message={message} 
              digitalHumanAvatar={digitalHumanAvatar}
              isStreaming={isStreaming}
            />
          );
        })}
        
        {isThinking && messages.length > 0 && messages[messages.length - 1].type === 'user' && (
          <ThinkingBubble digitalHumanAvatar={digitalHumanAvatar} />
        )}
      </div>
    </div>
  );
}