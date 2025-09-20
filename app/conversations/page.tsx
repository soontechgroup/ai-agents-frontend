'use client';

import { useState, useEffect } from 'react';
import { conversationService, digitalHumanService } from '@/lib/api';
import { ConversationPageResponse } from '@/lib/types/conversation';
import { DigitalHuman } from '@/lib/types/digital-human';
import ConversationList from '@/components/conversations/ConversationList';
import { Search } from 'lucide-react';
import Navbar from '@/components/navbar';
import BottomNav from '@/components/bottom-nav';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationPageResponse | null>(null);
  const [digitalHumans, setDigitalHumans] = useState<Map<number, DigitalHuman>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isInitialized, setIsInitialized] = useState(false);

  // 获取会话列表
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await conversationService.getConversations({
        page: currentPage,
        size: 12,
        search: searchQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setConversations(response);

      // 获取涉及的数字人信息
      if (response.data && response.data.length > 0) {
        const digitalHumanIds = [...new Set(response.data.map(c => c.digital_human_id))];
        const dhMap = new Map<number, DigitalHuman>();

        // 批量获取数字人信息
        for (const id of digitalHumanIds) {
          try {
            const dhData = await digitalHumanService.getDigitalHuman(id);
            if (dhData) {
              dhMap.set(id, dhData);
            }
          } catch (error) {
            console.error(`Failed to fetch digital human ${id}:`, error);
          }
        }
        setDigitalHumans(dhMap);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时加载数据
  useEffect(() => {
    if (!isInitialized) {
      fetchConversations();
      setIsInitialized(true);
    }
  }, []);

  // 监听分页和过滤器变化（排除初始化）
  useEffect(() => {
    if (isInitialized) {
      fetchConversations();
    }
  }, [currentPage, statusFilter]);

  // 搜索防抖
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchConversations();
      } else {
        setCurrentPage(1);  // 这会触发上面的 useEffect
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen relative">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <Navbar />

      <main className="relative z-10 pt-20 pb-20 lg:pb-6">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* 页面标题 */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">
            我的会话
          </h1>

          {/* 搜索和筛选区域 */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 搜索栏 */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索会话标题或数字人名称..."
                    className="w-full pl-14 pr-6 py-4 rounded-2xl text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-default)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1), var(--glow-sm)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-default)';
                      e.target.style.boxShadow = '';
                    }}
                  />
                </div>
              </div>

              {/* 筛选标签 */}
              <div className="flex gap-2 lg:gap-3">
                {(['all', 'active', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={`px-5 py-4 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-default)]'
                    }`}
                    style={{
                      boxShadow: statusFilter === status ? 'var(--glow-sm)' : ''
                    }}
                  >
                    {status === 'all' ? '全部会话' : status === 'active' ? '活跃' : '已归档'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 会话列表 */}
          <ConversationList
            conversations={conversations}
            digitalHumans={digitalHumans}
            loading={loading}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}