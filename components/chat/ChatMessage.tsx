'use client';

import { ChatMessage as ChatMessageType } from '@/lib/types/digital-human';
import StreamingMessage from './StreamingMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  digitalHumanAvatar?: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, digitalHumanAvatar = '🎤', isStreaming = false }: ChatMessageProps) {
  const isUser = message.type === 'user';
  const time = message.timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex gap-4 max-w-[900px] w-full mx-auto animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0 ${
          isUser 
            ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-default)]' 
            : 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--bg-primary)]'
        }`}
      >
        {isUser ? '我' : digitalHumanAvatar}
      </div>

      {/* 消息气泡 */}
      <div 
        className={`max-w-[75%] px-6 py-4 rounded-2xl border ${
          isUser
            ? 'bg-[rgba(0,217,255,0.1)] border-[var(--accent-primary)]'
            : 'bg-[var(--bg-tertiary)] border-[var(--border-default)]'
        }`}
      >
        <div className={`leading-relaxed ${
          isUser ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
        }`}>
          {!isUser && isStreaming ? (
            <StreamingMessage 
              content={message.content} 
              isStreaming={true}
              speed={10}
            />
          ) : (
            <p className="whitespace-pre-line">{message.content}</p>
          )}
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-2">
          {time}
        </div>
      </div>
    </div>
  );
}