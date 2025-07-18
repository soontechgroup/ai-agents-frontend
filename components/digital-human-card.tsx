'use client';

import Link from 'next/link';
import { MessageCircle, ThumbsUp } from 'lucide-react';

interface DigitalHumanCardProps {
  id?: string;
  name: string;
  description: string;
  status?: 'online' | 'offline';
  chats?: number;
  likes?: number;
  imageUrl?: string;
  isCreateNew?: boolean;
}

export default function DigitalHumanCard({
  id = '1',
  name,
  description,
  status = 'online',
  chats = 0,
  likes = 0,
  imageUrl,
  isCreateNew = false
}: DigitalHumanCardProps) {
  if (isCreateNew) {
    return (
      <Link
        href="/create"
        className="block w-full min-h-[400px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
        style={{
          backgroundColor: 'rgba(22, 33, 62, 0.5)',
          borderColor: 'var(--border-default)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(22, 33, 62, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.backgroundColor = 'rgba(22, 33, 62, 0.5)';
        }}
      >
        <div className="text-5xl text-[var(--accent-primary)] mb-4">＋</div>
        <div className="text-[var(--text-secondary)]">创建新数字人</div>
      </Link>
    );
  }

  return (
    <Link
      href={`/digital-human/${id}`}
      className="block w-full rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer relative"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-default)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
    >
      <div className="h-[350px] relative overflow-hidden" style={{
        background: imageUrl 
          ? `url(${imageUrl}) center/cover` 
          : 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)'
      }}>
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
            数字人形象
          </div>
        )}
        
        {status === 'online' && (
          <span 
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs backdrop-blur-[10px]"
            style={{
              backgroundColor: 'rgba(0, 245, 160, 0.2)',
              border: '1px solid var(--success)',
              color: 'var(--success)'
            }}
          >
            在线
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">{name}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{description}</p>
        
        <div 
          className="flex gap-6 pt-4" 
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <MessageCircle size={16} className="text-[var(--accent-primary)]" />
            <span>{chats > 1000 ? `${(chats / 1000).toFixed(1)}k` : chats}次对话</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <ThumbsUp size={16} className="text-[var(--accent-primary)]" />
            <span>{likes}赞</span>
          </div>
        </div>
      </div>
    </Link>
  );
}