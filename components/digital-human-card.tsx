'use client';

import Link from 'next/link';
import { MessageCircle, ThumbsUp, Lock, Eye, Edit } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface DigitalHumanCardProps {
  id?: string;
  name: string;
  description: string;
  status?: 'online' | 'offline';
  chats?: number;
  likes?: number;
  imageUrl?: string;
  isCreateNew?: boolean;
  canAccess?: boolean;
  accessLevel?: 'view' | 'chat' | 'edit' | 'owner';
  isOwner?: boolean;
}

export default function DigitalHumanCard({
  id = '1',
  name,
  description,
  status = 'online',
  chats = 0,
  likes = 0,
  imageUrl,
  isCreateNew = false,
  canAccess = true,
  accessLevel = 'chat',
  isOwner = false
}: DigitalHumanCardProps) {
  // 必须在任何条件返回之前调用所有Hooks
  const { showToast, ToastContainer } = useToast();
  
  if (isCreateNew) {
    return (
      <Link
        href="/create"
        className="block w-full min-h-[400px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
        style={{
          backgroundColor: 'rgba(22, 33, 62, 0.5)',
          borderColor: 'var(--border-default)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(22, 33, 62, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.backgroundColor = 'rgba(22, 33, 62, 0.5)';
        }}
      >
        <div className="text-5xl text-[var(--accent-primary)] mb-4">＋</div>
        <div className="text-[var(--text-secondary)]">创建新数字人</div>
      </Link>
    );
  }

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    console.log('[DigitalHumanCard] Clicked digital human:', { id, name, canAccess, accessLevel });
    
    if (!canAccess) {
      e.preventDefault();
      showToast({
        message: '您没有权限访问该数字人',
        type: 'info'
      });
    } else if (accessLevel === 'view') {
      e.preventDefault();
      showToast({
        message: '该数字人仅供查看，暂不支持对话',
        type: 'info'
      });
    }
  };

  // 获取访问级别图标
  const getAccessIcon = () => {
    if (!canAccess) return <Lock size={16} />;
    switch (accessLevel) {
      case 'view': return <Eye size={16} />;
      case 'edit': return <Edit size={16} />;
      case 'owner': return null;
      default: return null;
    }
  };

  // 获取访问级别文本
  const getAccessText = () => {
    if (!canAccess) return '无权访问';
    switch (accessLevel) {
      case 'view': return '仅查看';
      case 'edit': return '可编辑';
      case 'owner': return '我的';
      default: return '';
    }
  };

  const CardContent = (
    <>
      <div className="h-[350px] relative overflow-hidden" style={{
        background: imageUrl 
          ? `url(${imageUrl}) center/cover` 
          : 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)'
      }}>
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
            数字人形象
          </div>
        )}
        
        {/* 状态标签 */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {status === 'online' && canAccess && (
            <span 
              className="px-3 py-1 rounded-full text-xs backdrop-blur-[10px]"
              style={{
                backgroundColor: 'rgba(0, 245, 160, 0.2)',
                border: '1px solid var(--success)',
                color: 'var(--success)'
              }}
            >
              在线
            </span>
          )}
          
          {/* 权限标签 */}
          {(!canAccess || accessLevel !== 'chat') && (
            <span 
              className="px-3 py-1 rounded-full text-xs backdrop-blur-[10px] flex items-center gap-1"
              style={{
                backgroundColor: !canAccess ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${!canAccess ? 'rgba(255, 0, 0, 0.5)' : 'var(--border-default)'}`,
                color: !canAccess ? '#ff6b6b' : 'var(--text-secondary)'
              }}
            >
              {getAccessIcon()}
              {getAccessText()}
            </span>
          )}
          
          {/* 创建者标签 */}
          {isOwner && (
            <span 
              className="px-3 py-1 rounded-full text-xs backdrop-blur-[10px]"
              style={{
                backgroundColor: 'rgba(0, 217, 255, 0.2)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--accent-primary)'
              }}
            >
              我的
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">{name}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{description}</p>
        
        <div 
          className="flex gap-6 pt-4" 
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <MessageCircle size={16} className="text-[var(--accent-primary)]" />
            <span>{chats > 1000 ? `${(chats / 1000).toFixed(1)}k` : chats}次对话</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <ThumbsUp size={16} className="text-[var(--accent-primary)]" />
            <span>{likes}赞</span>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );

  // 如果可以访问，使用 Link 组件
  if (canAccess && accessLevel !== 'view') {
    return (
      <Link
        href={`/digital-human/${id}`}
        onClick={handleClick}
        className="block w-full rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer relative"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-default)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
    >
      {CardContent}
    </Link>
    );
  }

  // 否则使用 div，并在点击时显示提示
  return (
    <div
      onClick={handleClick}
      className="block w-full rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer relative"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-default)',
        opacity: canAccess ? 1 : 0.7
      }}
      onMouseEnter={(e) => {
        if (canAccess) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-sm)';
          e.currentTarget.style.borderColor = 'var(--border-hover)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
    >
      {CardContent}
    </div>
  );
}