'use client';

import Link from 'next/link';
import { MessageCircle, Lock, Eye, Edit } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface DigitalHumanCardProps {
  id?: string;
  name: string;
  description: string;
  status?: 'online' | 'offline';
  chats?: number;
  likes?: number;
  type?: string;
  skills?: string[];
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
  type,
  skills,
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
        className="block w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
        style={{
          backgroundColor: 'rgba(22, 33, 62, 0.5)',
          borderColor: 'var(--border-default)',
          minHeight: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(22, 33, 62, 0.7)';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-sm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.backgroundColor = 'rgba(22, 33, 62, 0.5)';
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div className="text-3xl text-[var(--accent-primary)] mb-2">＋</div>
        <div className="text-sm text-[var(--text-secondary)]">创建新数字人</div>
      </Link>
    );
  }

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
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
      <div className="p-5 relative">
        {/* 权限和创建者标签 */}
        <div className="absolute top-3 right-3 flex gap-2">
          {(!canAccess || accessLevel !== 'chat') && (
            <span
              className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
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

          {isOwner && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
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

        <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)] pr-20">{name}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{description}</p>

        <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
          {type && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <span className="px-2 py-0.5 bg-[var(--bg-primary)] rounded text-xs">{type}</span>
            </div>
          )}
          {skills && skills.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] flex-1">
              <span className="text-xs">技能: {skills.slice(0, 2).join('、')}{skills.length > 2 ? '...' : ''}</span>
            </div>
          )}
          {!type && !skills && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <MessageCircle size={14} className="text-[var(--accent-primary)]" />
              <span className="text-xs">智能助手</span>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );

  // 如果可以访问，使用 Link 组件
  if (canAccess && accessLevel !== 'view') {
    return (
      <Link
        href={`/digital-human/${id}/chat`}
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