'use client';

import { MemoryItem } from '@/lib/types/memory';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryListSkeleton } from './MemoryItemSkeleton';

interface RecentMemoriesProps {
  memories: MemoryItem[];
  onMemoryClick: (memory: MemoryItem) => void;
}

function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  } catch {
    return timestamp;
  }
}

export function RecentMemories({ memories, onMemoryClick }: RecentMemoriesProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // 模拟加载状态
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [memories]);
  
  if (isLoading) {
    return <MemoryListSkeleton count={3} />;
  }
  
  if (!memories || memories.length === 0) {
    return (
      <motion.div 
        className="flex-1 flex items-center justify-center text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        暂无记忆记录
      </motion.div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3">
      <AnimatePresence mode="popLayout">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMemoryClick(memory)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3.5 cursor-pointer hover:bg-gray-750 hover:border-gray-600 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {memory.preview || memory.content}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {memory.content}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(memory.timestamp)}
              </span>
              <motion.svg 
                className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ x: [0, 3, 0] }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}