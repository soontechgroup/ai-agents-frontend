'use client';

import { DigitalHuman } from '@/lib/types/digital-human';

interface ChatSidebarProps {
  digitalHuman: DigitalHuman;
  onUseTopic: (topic: string) => void;
}

export default function ChatSidebar({ digitalHuman, onUseTopic }: ChatSidebarProps) {
  return (
    <aside className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-default)] flex flex-col py-8 relative z-10">
      {/* 数字人信息卡片 */}
      <div className="px-6 mb-8">
        <div className="p-6 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-xl flex items-center justify-center text-2xl font-bold text-[var(--bg-primary)] shadow-[var(--glow-sm)]">
              {digitalHuman.avatar}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                {digitalHuman.name}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {digitalHuman.short_description || digitalHuman.detailed_description || '数字人助手'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 数字人详情 */}
      <div className="px-6 mb-8">
        <h3 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">
          关于助手
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
            <span className="text-[var(--text-secondary)]">专长领域</span>
            <span className="text-[var(--text-primary)] font-medium">
              {digitalHuman.specialties?.join('、') || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
            <span className="text-[var(--text-secondary)]">对话次数</span>
            <span className="text-[var(--text-primary)] font-medium">
              {digitalHuman.chats}次
            </span>
          </div>
          <div className="flex justify-between items-center py-3 text-sm">
            <span className="text-[var(--text-secondary)]">用户评分</span>
            <span className="text-[var(--text-primary)] font-medium">
              ⭐ {digitalHuman.rating || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 话题推荐 */}
      <div className="px-6 flex-1 overflow-y-auto">
        <h3 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">
          推荐话题
        </h3>
        <div className="space-y-3">
          {digitalHuman.topics?.map((topic, index) => (
            <button
              key={index}
              onClick={() => onUseTopic(topic)}
              className="w-full p-4 text-left text-sm bg-[rgba(0,217,255,0.05)] border border-[var(--border-default)] rounded-lg transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[var(--accent-primary)] hover:translate-x-1"
            >
              {['💭', '🎯', '✨', '💼'][index]} {topic}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}