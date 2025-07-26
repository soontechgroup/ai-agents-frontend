'use client';

import { ArrowLeft, Star, Share2, MessageCircle } from 'lucide-react';
import { DigitalHuman } from '@/lib/types/digital-human';

interface ChatTopbarProps {
  digitalHuman: DigitalHuman;
  sessionStartTime: number;
  messageCount: number;
  isFavorited: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
}

export default function ChatTopbar({
  digitalHuman,
  sessionStartTime,
  messageCount,
  isFavorited,
  onBack,
  onToggleFavorite,
  onShare
}: ChatTopbarProps) {
  return (
    <header className="h-16 bg-[rgba(26,26,46,0.8)] backdrop-blur-[20px] border-b border-[var(--border-default)] flex items-center px-8 gap-8">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-lg border border-[var(--border-default)] bg-transparent flex items-center justify-center text-[var(--text-primary)] transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[var(--accent-primary)] hover:-translate-x-0.5"
      >
        <ArrowLeft size={20} />
      </button>

      {/* 会话信息 */}
      <div className="flex-1 flex items-center gap-8">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {digitalHuman.name}
        </h1>
        
        <div className="flex gap-6 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span>{messageCount} 条消息</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button
          onClick={onToggleFavorite}
          className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg text-sm flex items-center gap-2 transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[var(--accent-primary)]"
        >
          <Star size={16} className={isFavorited ? 'fill-[var(--warning)] text-[var(--warning)]' : ''} />
          <span className="text-[var(--text-primary)]">收藏</span>
        </button>
        
        <button
          onClick={onShare}
          className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg text-sm flex items-center gap-2 transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[var(--accent-primary)]"
        >
          <Share2 size={16} />
          <span className="text-[var(--text-primary)]">分享</span>
        </button>
      </div>
    </header>
  );
}