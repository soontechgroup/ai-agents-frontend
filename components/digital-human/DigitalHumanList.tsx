'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import DigitalHumanCard from '@/components/digital-human-card';
import { digitalHumanService } from '@/lib/api';
import { DigitalHuman } from '@/lib/types/digital-human';

// 简化的数字人卡片数据接口
interface DigitalHumanCardData {
  id: string;
  name: string;
  description: string;
  is_active?: boolean;
  chats: number;
  likes: number;
  type?: string;
  skills?: string[];
  imageUrl?: string;
  canAccess: boolean;
  accessLevel: 'view' | 'chat' | 'edit' | 'owner';
  isOwner: boolean;
}

interface DigitalHumanListProps {
  title?: string;
  pageSize?: number;
  showSearch?: boolean;
  showCreateCard?: boolean;
  searchPlaceholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
}

export default function DigitalHumanList({
  title = '热门数字人',
  pageSize = 20,
  showSearch = true,
  showCreateCard = true,
  searchPlaceholder = '搜索数字人、功能或话题...',
  emptyStateTitle = '还没有数字人',
  emptyStateDescription = '创建第一个数字人开始您的AI之旅',
  className = ''
}: DigitalHumanListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [digitalHumans, setDigitalHumans] = useState<DigitalHumanCardData[]>([]);

  // 获取数字人列表
  useEffect(() => {
    const fetchDigitalHumans = async () => {
      try {
        const response = await digitalHumanService.getDigitalHumans({
          page: 1,
          size: pageSize,
          search: searchQuery
        });

        // 立即转换数据并只保存需要的字段
        if (response.data && Array.isArray(response.data)) {
          const mappedData = response.data.map(mapDigitalHumanData);
          setDigitalHumans(mappedData);
        } else {
          setDigitalHumans([]);
        }
      } catch (error) {
        setDigitalHumans([]);
      }
    };

    fetchDigitalHumans();
  }, [searchQuery, pageSize]);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 数据转换函数：将后端数据映射为组件需要的格式
  const mapDigitalHumanData = (human: DigitalHuman): DigitalHumanCardData => {
    // 基于已知ID判断权限（临时逻辑，等待后端提供权限信息）
    const knownInaccessibleIds = ['15', '16', '17']; // 已知无法访问的ID
    const id = String(human.id);
    const canAccess = !knownInaccessibleIds.includes(id);
    
    return {
      id: id, // 确保 ID 总是字符串类型
      name: human.name,
      description: human.short_description || human.detailed_description || '暂无描述',
      is_active: human.is_active,
      chats: human.chats || 0,
      likes: human.likes || 0,
      type: human.type,
      skills: human.skills,
      imageUrl: human.imageUrl || human.avatar,
      // 权限相关字段
      canAccess: human.canAccess ?? canAccess,
      accessLevel: human.accessLevel || (canAccess ? 'chat' : 'view'),
      isOwner: human.isOwner || false
    };
  };

  return (
    <div className={className}>
      {/* Search Section */}
      {showSearch && (
        <section className="max-w-3xl mx-auto mb-4 lg:mb-8">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
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
        </section>
      )}

      {/* Digital Humans Section */}
      <section className="w-full">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
          {searchQuery ? '搜索结果' : title}
        </h2>

        {/* 数字人列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {digitalHumans.length > 0 ? (
            <>
              {digitalHumans.map((human) => (
                <DigitalHumanCard
                  key={human.id}
                  id={human.id}
                  name={human.name}
                  description={human.description}
                  is_active={human.is_active}
                  chats={human.chats}
                  likes={human.likes}
                  type={human.type}
                  skills={human.skills}
                  imageUrl={human.imageUrl}
                  canAccess={human.canAccess}
                  accessLevel={human.accessLevel}
                  isOwner={human.isOwner}
                />
              ))}
              
              {showCreateCard && (
                <DigitalHumanCard
                  name=""
                  description=""
                  isCreateNew={true}
                />
              )}
            </>
          ) : (
            <div className="col-span-full text-center py-16 text-[var(--text-secondary)]">
              <div className="text-5xl mb-4 opacity-30">🤖</div>
              <p className="mb-6">
                {searchQuery ? '没有找到相关数字人' : emptyStateTitle}
              </p>
              <p className="text-sm mb-6">
                {searchQuery ? '试试其他关键词' : emptyStateDescription}
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                <span>＋</span>
                <span>创建数字人</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 