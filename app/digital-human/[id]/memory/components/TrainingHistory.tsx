'use client';

import { useState, useEffect } from 'react';
import { memoryService } from '@/lib/api/services/memory.service';
import { TrainingMessage } from '@/lib/types/memory';
import { ChevronLeft, ChevronRight, MessageCircle, Bot, Brain } from 'lucide-react';

interface TrainingHistoryProps {
  digitalHumanId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TrainingHistory({ digitalHumanId, isOpen, onClose }: TrainingHistoryProps) {
  const [messages, setMessages] = useState<TrainingMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<TrainingMessage | null>(null);

  useEffect(() => {
    if (isOpen && digitalHumanId) {
      loadMessages();
    }
  }, [isOpen, digitalHumanId, currentPage]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await memoryService.getTrainingMessages(digitalHumanId, currentPage, 10);
      if (response.code === 0 && response.data) {
        setMessages(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load training messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-5xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold text-white">训练历史</h2>
            <span className="text-sm text-gray-400">共 {messages.length} 条记录</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              暂无训练记录
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${message.role === 'assistant' ? 'text-right' : ''}`}>
                    <div
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gray-800 border border-gray-700'
                          : 'bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-800/50'
                      } cursor-pointer hover:border-cyan-500/50 transition-colors`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                    
                    {/* 知识抽取显示 */}
                    {message.extracted_knowledge && Object.keys(message.extracted_knowledge).length > 0 && (
                      <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs text-cyan-400">抽取的知识</span>
                        </div>
                        <div className="text-xs text-gray-300 space-y-1">
                          {Object.entries(message.extracted_knowledge).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500">{key}:</span>{' '}
                              <span>{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
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
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}