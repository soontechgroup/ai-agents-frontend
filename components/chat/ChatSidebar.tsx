'use client';

import { useState, useEffect } from 'react';
import { DigitalHuman } from '@/lib/types/digital-human';
import { Conversation } from '@/lib/types/conversation';
import { conversationService } from '@/lib/api/services/conversation.service';
import { MessageSquare, Plus, Calendar } from 'lucide-react';

interface ChatSidebarProps {
  digitalHuman: DigitalHuman;
  currentConversation?: Conversation | null;
  onUseTopic: (topic: string) => void;
  onSelectConversation?: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

export default function ChatSidebar({ 
  digitalHuman, 
  currentConversation,
  onUseTopic,
  onSelectConversation,
  onNewConversation 
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // 加载会话历史
  useEffect(() => {
    const loadConversations = async () => {
      if (!digitalHuman?.id) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await conversationService.getConversations({
          page: 1,
          size: 10,
          status: 'active'
        });
        
        if (response.data) {
          // 过滤当前数字人的会话
          const filtered = response.data.filter(
            conv => conv.digital_human_id === digitalHuman.id
          );
          setConversations(filtered);
        }
      } catch (error) {
        console.error('加载会话历史失败:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadConversations();
  }, [digitalHuman?.id]);
  return (
    <aside className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-default)] flex flex-col py-8 relative z-10">
      {/* 新建会话按钮 */}
      <div className="px-6 mb-4">
        <button
          onClick={onNewConversation}
          className="w-full py-3 px-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--bg-primary)] rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          新建对话
        </button>
      </div>
      
      {/* 会话历史 */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-sm text-[var(--text-muted)] uppercase tracking-wider mb-3 hover:text-[var(--text-secondary)] transition-colors"
        >
          <span>历史会话</span>
          <span className="text-xs">{showHistory ? '▲' : '▼'}</span>
        </button>
        
        {showHistory && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {isLoadingHistory ? (
              <div className="text-sm text-[var(--text-muted)] text-center py-2">
                加载中...
              </div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation?.(conv)}
                  className={`w-full p-3 text-left text-sm rounded-lg border transition-all duration-200 ${
                    currentConversation?.id === conv.id
                      ? 'bg-[rgba(0,217,255,0.1)] border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] hover:bg-[rgba(0,217,255,0.05)]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="mt-0.5 text-[var(--text-muted)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] truncate">
                        {conv.title || '无标题对话'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                        <Calendar size={10} />
                        {new Date(conv.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm text-[var(--text-muted)] text-center py-2">
                暂无历史会话
              </div>
            )}
          </div>
        )}
      </div>

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