'use client';

import { User } from '@/lib/types';

interface PersonalInfoProps {
  user: User;
}

export default function PersonalInfo({ user }: PersonalInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <div className="bg-[#16213E] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 backdrop-blur-xl shadow-[0_10px_15px_rgba(0,217,255,0.15)]">
      <h3 className="text-xl font-semibold mb-6 text-[#F5F5F5] flex items-center gap-2">
        <div className="w-1 h-5 bg-gradient-to-b from-[#00D9FF] to-[#7B68EE] rounded-full" />
        个人信息
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex justify-between items-center p-4 bg-[rgba(0,217,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF]">
          <span className="text-[#B8BCC8] text-sm">用户名</span>
          <span className="text-[#F5F5F5] font-medium">{user.username}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[rgba(0,217,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF]">
          <span className="text-[#B8BCC8] text-sm">用户ID</span>
          <span className="text-[#F5F5F5] font-medium">{user.id}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[rgba(0,217,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF]">
          <span className="text-[#B8BCC8] text-sm">注册时间</span>
          <span className="text-[#F5F5F5] font-medium">{formatDate(user.created_at)}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[rgba(0,217,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF]">
          <span className="text-[#B8BCC8] text-sm">邮箱</span>
          <span className="text-[#F5F5F5] font-medium">{user.email}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-[rgba(0,217,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg transition-all duration-300 hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF]">
          <span className="text-[#B8BCC8] text-sm">最后登录</span>
          <span className="text-[#F5F5F5] font-medium">{formatDateTime(user.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}