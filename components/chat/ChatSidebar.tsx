'use client';

import { DigitalHuman } from '@/lib/types/digital-human';

interface ChatSidebarProps {
  digitalHuman: DigitalHuman;
}

export default function ChatSidebar({
  digitalHuman
}: ChatSidebarProps) {
  return (
    <aside className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-default)] flex flex-col py-8 relative z-10">
      {/* 数字人信息卡片 */}
      <div className="px-6 mb-8">
        <div className="p-6 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {digitalHuman.name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {digitalHuman.short_description || digitalHuman.detailed_description || '数字人助手'}
            </p>
          </div>
        </div>
      </div>

      {/* 数字人详情 */}
      <div className="px-6 mb-8">
        <h3 className="text-sm text-[var(--text-muted)] uppercase tracking-wider mb-4">
          关于助手
        </h3>
        <div className="space-y-3">
          {digitalHuman.type && (
            <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">类型</span>
              <span className="text-[var(--text-primary)] font-medium">
                {digitalHuman.type}
              </span>
            </div>
          )}
          {digitalHuman.specialties && digitalHuman.specialties.length > 0 && (
            <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">专长领域</span>
              <span className="text-[var(--text-primary)] font-medium">
                {digitalHuman.specialties.join('、')}
              </span>
            </div>
          )}
          {digitalHuman.skills && digitalHuman.skills.length > 0 && (
            <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">技能</span>
              <span className="text-[var(--text-primary)] font-medium">
                {digitalHuman.skills.slice(0, 3).join('、')}{digitalHuman.skills.length > 3 ? '...' : ''}
              </span>
            </div>
          )}
          {digitalHuman.conversation_style && (
            <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">对话风格</span>
              <span className="text-[var(--text-primary)] font-medium">
                {digitalHuman.conversation_style}
              </span>
            </div>
          )}
          {digitalHuman.is_active !== undefined && (
            <div className="flex justify-between items-center py-3 text-sm border-b border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)]">模板状态</span>
              <span className="text-[var(--text-primary)] font-medium">
                <span className={`inline-flex items-center gap-1 ${
                  digitalHuman.is_active ? 'text-green-500' : 'text-gray-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    digitalHuman.is_active ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  {digitalHuman.is_active ? '已启用' : '未启用'}
                </span>
              </span>
            </div>
          )}
          {digitalHuman.created_at && (
            <div className="flex justify-between items-center py-3 text-sm">
              <span className="text-[var(--text-secondary)]">服务时长</span>
              <span className="text-[var(--text-primary)] font-medium">
                {(() => {
                  const days = Math.floor((Date.now() - new Date(digitalHuman.created_at).getTime()) / (1000 * 60 * 60 * 24));
                  if (days === 0) return '今天加入';
                  if (days < 30) return `${days} 天`;
                  if (days < 365) return `${Math.floor(days / 30)} 个月`;
                  return `${Math.floor(days / 365)} 年`;
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}