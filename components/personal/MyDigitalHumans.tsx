'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, MessageCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { digitalHumanService } from '@/lib/api';
import { DigitalHuman, DigitalHumanPageRequest } from '@/lib/types/digital-human';
import { useAuth } from '@/components/providers/auth-provider';

interface MyDigitalHumansProps {
  onDigitalHumansCountChange?: (count: number) => void;
  onDataChange?: (data: any) => void;
  cachedData?: any;
}

export default function MyDigitalHumans({ onDigitalHumansCountChange, onDataChange, cachedData }: MyDigitalHumansProps) {
  const { user } = useAuth();
  const [digitalHumans, setDigitalHumans] = useState<DigitalHuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDigitalHumans = useCallback(async (params: DigitalHumanPageRequest = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await digitalHumanService.getDigitalHumans({
        page: currentPage,
        size: 6, // 每页显示6个
        search: searchQuery || undefined,
        ...params
      });
      
      if (response.code === 200) {
        setDigitalHumans(response.data);
        setTotalPages(response.pagination.pages);
        setTotalCount(response.pagination.total);
        
        // 通知父组件数字人数量变化
        onDigitalHumansCountChange?.(response.pagination.total);
        
        // 缓存数据到父组件（仅首页且无搜索时）
        if (currentPage === 1 && !searchQuery) {
          onDataChange?.({
            digitalHumans: response.data,
            totalPages: response.pagination.pages,
            totalCount: response.pagination.total
          });
        }
      } else {
        setError(response.message || '获取数字人列表失败');
      }
    } catch (err: any) {
      setError(err?.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, searchQuery]); // 移除会导致循环的依赖

  useEffect(() => {
    // 如果有缓存数据且是首次加载，使用缓存
    if (cachedData && currentPage === 1 && !searchQuery) {
      setDigitalHumans(cachedData.digitalHumans || []);
      setTotalPages(cachedData.totalPages || 1);
      setTotalCount(cachedData.totalCount || 0);
      setLoading(false);
      // 移除这里的回调调用，避免循环
      return;
    }
    
    fetchDigitalHumans();
  }, [user, currentPage, searchQuery, cachedData, fetchDigitalHumans]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDigitalHumans({ page: 1, search: searchQuery || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    try {
      return new Date(dateString).toLocaleDateString('zh-CN');
    } catch {
      return '未知';
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除数字人"${name}"吗？此操作无法撤销。`)) {
      return;
    }

    try {
      await digitalHumanService.deleteDigitalHuman(id);
      // 重新获取列表
      fetchDigitalHumans();
    } catch (err: any) {
      alert('删除失败：' + (err?.message || '未知错误'));
    }
  };

  // 保持组件结构一致，在内部显示loading状态
  const isInitialLoading = loading && digitalHumans.length === 0;

  return (
    <div id="my-digital-humans-section" className="bg-[#16213E] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 backdrop-blur-xl shadow-[0_10px_15px_rgba(0,217,255,0.15)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-[#F5F5F5] mb-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-[#00D9FF] to-[#7B68EE] rounded-full" />
            我的数字人
          </h3>
          <p className="text-[#6C7293] text-sm">共 {totalCount} 个数字人</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] text-[#0A1628] rounded-md text-sm font-medium transition-all duration-300 shadow-[0_4px_6px_rgba(0,217,255,0.1)] hover:transform hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(0,217,255,0.15),0_0_20px_rgba(0,217,255,0.4)]"
        >
          <Plus size={16} />
          创建新数字人
        </Link>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="搜索我的数字人..."
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          搜索
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 数字人列表 */}
      {isInitialLoading ? (
        <div className="text-center py-16 text-[#6C7293]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D9FF] mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      ) : digitalHumans.length === 0 ? (
        <div className="text-center py-16 text-[#6C7293]">
          <div className="text-5xl mb-4 opacity-30">🤖</div>
          <p className="mb-6">您还没有创建数字人</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] text-[#0A1628] rounded-lg font-medium transition-all duration-300 shadow-[0_4px_6px_rgba(0,217,255,0.1)] hover:transform hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(0,217,255,0.15),0_0_20px_rgba(0,217,255,0.4)]"
          >
            <Plus size={16} />
            创建数字人
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {digitalHumans.map((human) => (
              <div
                key={human.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-lg mb-1">{human.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      {human.short_description || '暂无描述'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(human.created_at)}
                      </span>
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                        {human.type || '通用助手'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                  <Link
                    href={`/digital-human/${human.id}/chat`}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    <MessageCircle size={14} />
                    对话
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {/* TODO: 实现编辑功能 */}}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(human.id, human.name)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                上一页
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}