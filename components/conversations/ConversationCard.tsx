'use client';

import Link from 'next/link';
import { MessageCircle, Clock, User } from 'lucide-react';
import { Conversation } from '@/lib/types/conversation';
import { DigitalHuman } from '@/lib/types/digital-human';

interface ConversationCardProps {
  conversation: Conversation;
  digitalHuman?: DigitalHuman;
}

export default function ConversationCard({ conversation, digitalHuman }: ConversationCardProps) {
  // 格式化时间显示
  const formatTime = (dateStr: string | undefined) => {
    if (!dateStr) return '暂无消息';

    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      // 今天
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const displayName = digitalHuman?.name || `数字人 #${conversation.digital_human_id}`;
  const displayTitle = conversation.title || '未命名对话';
  const displayTime = formatTime(conversation.last_message_at || conversation.created_at);

  return (
    <Link
      href={`/digital-human/${conversation.digital_human_id}/chat`}
      className="block w-full p-4 rounded-xl transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-default)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--glow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex items-start gap-3">
        {/* 头像占位符 */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">
                {displayName}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">
                {displayTitle}
              </p>
            </div>

            {/* 时间 */}
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock size={12} />
              <span>{displayTime}</span>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MessageCircle size={12} />
              <span>对话中</span>
            </div>
            {digitalHuman?.type && (
              <span className="px-2 py-0.5 bg-[var(--bg-primary)] rounded text-xs text-[var(--text-secondary)]">
                {digitalHuman.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}