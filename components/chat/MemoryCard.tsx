'use client';

import { useState } from 'react';
import { Brain, ChevronRight, ExternalLink } from 'lucide-react';
import MemoryModal from './MemoryModal';

interface MemoryCardProps {
  content: string;
  metadata?: {
    count?: number;
    has_memory?: boolean;
    entities?: any[];
    messageType?: string;
    originalData?: any;
    [key: string]: any;
  };
  timestamp?: string;
}

export default function MemoryCard({ content, metadata, timestamp }: MemoryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);


  // 获取记忆数据
  let memories: any[] = [];
  let entityCount = 0;
  let summaryText = '正在检索记忆...';

  // 从多个可能的位置获取记忆数据
  if (metadata?.originalData) {
    const data = metadata.originalData;
    memories = data.memories || data.entities || data.data || data.results || [];
    entityCount = data.count || memories.length;
  } else if (metadata?.entities) {
    memories = metadata.entities;
    entityCount = metadata.count || memories.length;
  } else if (metadata?.count) {
    entityCount = metadata.count;
  }

  // 检查metadata中的其他字段
  if (memories.length === 0 && metadata) {
    // 查找任何可能是记忆数据的数组
    Object.keys(metadata).forEach(key => {
      if (Array.isArray(metadata[key]) && metadata[key].length > 0 && memories.length === 0) {
        memories = metadata[key];
        entityCount = memories.length;
      }
    });
  }

  // 生成摘要
  if (memories.length > 0) {
    const firstFew = memories.slice(0, 2).map(m =>
      m.name || m.entity || m.subject || m.label || m.title
    ).filter(Boolean);
    if (firstFew.length > 0) {
      summaryText = `包括: ${firstFew.join(', ')}${memories.length > 2 ? ' 等' : ''}`;
    } else {
      summaryText = `找到 ${entityCount} 个相关记忆`;
    }
  } else if (entityCount > 0) {
    summaryText = `找到 ${entityCount} 个相关记忆`;
  }


  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-purple-500/20 rounded">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-medium text-purple-300">记忆检索</div>
        </div>
        {entityCount > 0 && (
          <div className="text-sm text-gray-300 mb-2">
            {summaryText}
          </div>
        )}
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg group-hover:bg-purple-500/15 transition-colors">
          <span className="text-xs text-purple-400">
            {entityCount > 0 ? `查看 ${entityCount} 个记忆` : '正在处理...'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
        </div>
      </button>

      {/* 记忆详情弹框 */}
      <MemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={content}
        metadata={metadata}
      />
    </>
  );
}