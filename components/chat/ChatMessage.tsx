'use client';

import { ReactNode, memo } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types/digital-human';
import StreamingMessage from './StreamingMessage';

interface ExtendedChatMessage extends ChatMessageType {
  specialContent?: ReactNode;
  metadata?: {
    // 用户消息的 metadata
    input_tokens?: number;
    input_length?: number;
    // AI 消息的 metadata
    response_time_ms?: number;
    response_tokens?: number;
    response_length?: number;
    model?: string;
    temperature?: number;
    sync_mode?: boolean;
    timestamp?: string;
    [key: string]: any;
  };
}

interface ChatMessageProps {
  message: ExtendedChatMessage;
  digitalHumanAvatar?: string;
  isStreaming?: boolean;
}

const ChatMessage = memo(function ChatMessage({ message, digitalHumanAvatar = '🎤', isStreaming = false }: ChatMessageProps) {
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
        className={`max-w-[75%] px-6 py-4 rounded-2xl border transition-all duration-200 ${
          isUser
            ? 'bg-[rgba(0,217,255,0.1)] border-[var(--accent-primary)]'
            : 'bg-[var(--bg-tertiary)] border-[var(--border-default)]'
        }`}
        style={{ minHeight: '4rem' }}
      >
        {/* 特殊内容（如记忆卡片） */}
        {message.specialContent && (
          <div className="mb-3">
            {message.specialContent}
          </div>
        )}

        {/* 普通消息内容 */}
        {message.content && (
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
        )}

        {/* 时间信息 */}
        <div className="text-xs text-[var(--text-muted)] mt-2">
          {time}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化重渲染
  // 如果是同一个消息且流式状态相同，则不重新渲染
  if (prevProps.message.id !== nextProps.message.id) return false;

  // 如果是用户消息，内容不会变化，可以跳过重渲染
  if (prevProps.message.type === 'user') return true;

  // 对于 AI 消息，检查内容是否真的变化了
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

export default ChatMessage;