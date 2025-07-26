'use client';

import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ThinkingBubble from './ThinkingBubble';
import { ChatMessage as ChatMessageType } from '@/lib/types/digital-human';

interface ChatDialogueProps {
  messages: ChatMessageType[];
  isThinking: boolean;
  digitalHumanAvatar?: string;
}

export default function ChatDialogue({ messages, isThinking, digitalHumanAvatar }: ChatDialogueProps) {
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
        {messages.map(message => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            digitalHumanAvatar={digitalHumanAvatar}
          />
        ))}
        
        {isThinking && (
          <ThinkingBubble digitalHumanAvatar={digitalHumanAvatar} />
        )}
      </div>
    </div>
  );
}