'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Navbar from '@/components/navbar';
import DigitalHumanCard from '@/components/digital-human-card';
import BottomNav from '@/components/bottom-nav';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const digitalHumans = [
    {
      id: '1',
      name: '口才训练助手',
      description: '专业的演讲和沟通技巧训练，帮助您提升表达能力',
      status: 'online' as const,
      chats: 948,
      likes: 48
    },
    {
      id: '2',
      name: '心理咨询师',
      description: '提供专业的心理辅导和情绪管理建议',
      status: 'online' as const,
      chats: 1200,
      likes: 156
    },
    {
      id: '3',
      name: '编程导师',
      description: '一对一编程指导，从入门到精通',
      status: 'online' as const,
      chats: 2500,
      likes: 312
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Grid background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <Navbar />

      <main className="w-full py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Hero Section */}
        <section className="text-center py-8 lg:py-16 mb-8 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            探索AI数字人的无限可能
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] mb-8">
            创建属于您的专属数字人，开启智能对话新体验
          </p>
          
          <div className="flex justify-center">
            <Link
              href="/create"
              className="px-8 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 btn-gradient"
              style={{ boxShadow: 'var(--shadow-md)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--glow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <span>＋</span>
              <span>创建数字人</span>
            </Link>
          </div>
        </section>

        {/* Search Section */}
        <section className="max-w-3xl mx-auto mb-8 lg:mb-16">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索数字人、功能或话题..."
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

        {/* Digital Humans Grid */}
        <section 
          className="w-full p-6 sm:p-8 rounded-2xl"
          style={{
            backgroundColor: 'rgba(22, 33, 62, 0.3)',
            border: '1px solid var(--border-default)'
          }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-[var(--text-primary)]">热门数字人</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {digitalHumans.map((human) => (
            <DigitalHumanCard
              key={human.id}
              {...human}
            />
          ))}
          
          <DigitalHumanCard
            name=""
            description=""
            isCreateNew={true}
          />
          </div>
        </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}