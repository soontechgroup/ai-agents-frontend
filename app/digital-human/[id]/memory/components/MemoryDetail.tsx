'use client';

import { X } from 'lucide-react';
import { MemoryDetail as MemoryDetailType } from '@/lib/types/memory';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryDetailProps {
  memory: MemoryDetailType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryDetail({ memory, isOpen, onClose }: MemoryDetailProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && memory && (
        <motion.aside
          className="fixed top-20 right-5 w-96 max-h-[calc(100vh-100px)]
            bg-gray-900 border border-gray-800 rounded-2xl
            flex flex-col shadow-2xl z-50"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ 
            duration: 0.25,
            ease: "easeOut"
          }}
          style={{
            willChange: 'transform, opacity'
          }}
        >
          {/* 头部 */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-gray-100">{memory.title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md border border-gray-700 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all flex items-center justify-center text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* MongoDB 文档内容 */}
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
                记忆内容 (MongoDB)
              </h3>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {memory.content}
              </div>
            </section>

            {/* Neo4j 关系 */}
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
                知识关系 (Neo4j)
              </h3>
              <div className="space-y-2">
                {memory.relations.map((relation, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-cyan-500/5 border border-gray-800 rounded-md text-sm hover:bg-cyan-500/10 transition-colors"
                  >
                    <span className="text-gray-300">{relation.source}</span>
                    <span className="mx-2 text-cyan-400 font-medium">
                      → {relation.relation} →
                    </span>
                    <span className="text-gray-300">{relation.target}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Chroma 向量相似度 */}
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
                语义相似度 (Chroma)
              </h3>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">与当前查询的相似度</span>
                  <span className="text-xl font-semibold text-green-400">
                    {(memory.similarity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-3 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${memory.similarity * 100}%` }}
                  />
                </div>
              </div>
            </section>

            {/* 标签分类 */}
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
                标签分类
              </h3>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-400 hover:bg-purple-500/20 transition-colors"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </section>

            {/* 记忆形成过程 */}
            <section>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
                记忆形成过程
              </h3>
              <div className="relative pl-6">
                {/* 时间线 */}
                <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-800" />
                
                {memory.timeline.map((item, index) => (
                  <div key={index} className="relative mb-6 last:mb-0">
                    {/* 时间点 */}
                    <div className="absolute -left-[18px] top-1.5 w-3 h-3 bg-cyan-500 border-2 border-gray-900 rounded-full" />
                    
                    {/* 内容 */}
                    <div className="bg-cyan-500/5 rounded-md p-3">
                      <div className="text-xs text-gray-500 mb-1">{item.time}</div>
                      <div className="text-sm text-gray-300">{item.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}