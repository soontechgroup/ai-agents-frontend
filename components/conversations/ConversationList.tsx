'use client';

import { ConversationPageResponse } from '@/lib/types/conversation';
import { DigitalHuman } from '@/lib/types/digital-human';
import ConversationCard from './ConversationCard';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface ConversationListProps {
  conversations: ConversationPageResponse | null;
  digitalHumans: Map<number, DigitalHuman>;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ConversationList({
  conversations,
  digitalHumans,
  loading,
  currentPage,
  onPageChange
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]" />
      </div>
    );
  }

  if (!conversations || !conversations.data || conversations.data.length === 0) {
    return (
      <div className="text-center py-20">
        <MessageSquare size={64} className="mx-auto text-[var(--text-muted)] mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          暂无会话记录
        </h3>
        <p className="text-[var(--text-secondary)]">
          开始与数字人对话，您的会话记录将显示在这里
        </p>
      </div>
    );
  }

  const totalPages = conversations.pagination?.pages || 1;

  return (
    <div>
      {/* 会话卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.data.map((conversation) => (
          <ConversationCard
            key={`${conversation.digital_human_id}_${conversation.created_at}`}
            conversation={conversation}
            digitalHuman={digitalHumans.get(conversation.digital_human_id)}
          />
        ))}
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all ${
              currentPage === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    currentPage === pageNum
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-all ${
              currentPage === totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}