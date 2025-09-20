'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import BottomNav from '@/components/bottom-nav';
import { DigitalHumanList } from '@/components/digital-human';

export default function HomePage() {
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

      <main className="w-full py-2 sm:py-3 lg:py-4 pb-24 lg:pb-8">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Hero Section */}
          <section className="text-center py-4 lg:py-8 mb-4 lg:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 gradient-text">
              探索AI数字人的无限可能
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] mb-6">
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

          {/* Digital Human List Component */}
          <DigitalHumanList />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}