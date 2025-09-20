'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, User, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0
  });
  const navRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const [enableTransition, setEnableTransition] = useState(false);

  const navItems = [
    { href: '/', icon: <Home size={24} />, label: '首页' },
    { href: '/conversations', icon: <MessageCircle size={24} />, label: '会话' },
    { href: '/profile', icon: <User size={24} />, label: '我的' },
  ];

  // 启用动画（延迟执行，避免初始动画）
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnableTransition(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // 更新指示器位置
  useEffect(() => {
    if (!navRef.current) return;

    const activeIndex = navItems.findIndex(item => item.href === pathname);
    if (activeIndex === -1) {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const items = navRef.current.querySelectorAll('a[data-nav-item]');
    const activeItem = items[activeIndex];
    if (activeItem) {
      // 小延迟确保 DOM 渲染完成
      requestAnimationFrame(() => {
        const rect = activeItem.getBoundingClientRect();
        const navRect = navRef.current?.getBoundingClientRect();
        if (navRect) {
          setIndicatorStyle({
            left: rect.left - navRect.left,
            width: rect.width,
            opacity: 1
          });
        }
      });
    }

    isMountedRef.current = true;
  }, [pathname]);

  // 窗口大小变化时更新位置
  useEffect(() => {
    const handleResize = () => {
      if (!navRef.current) return;

      const activeIndex = navItems.findIndex(item => item.href === pathname);
      if (activeIndex === -1) return;

      const items = navRef.current.querySelectorAll('a[data-nav-item]');
      const activeItem = items[activeIndex];
      if (activeItem) {
        const rect = activeItem.getBoundingClientRect();
        const navRect = navRef.current.getBoundingClientRect();

        setIndicatorStyle({
          left: rect.left - navRect.left,
          width: rect.width,
          opacity: 1
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 w-full lg:hidden z-[100] backdrop-blur-[20px]"
      style={{
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        borderTop: '1px solid var(--border-default)',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="w-full px-4 py-2">
        <div ref={navRef} className="flex justify-around items-center relative">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-nav-item
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all z-10 ${
                pathname === item.href
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}

          {/* 动画指示器 */}
          <div
            className={`absolute top-0 h-full rounded-lg ${enableTransition ? 'transition-all duration-300 ease-out' : ''}`}
            style={{
              background: 'rgba(0, 217, 255, 0.1)',
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              boxShadow: indicatorStyle.opacity > 0 ? '0 0 20px rgba(0, 217, 255, 0.3)' : 'none',
              opacity: indicatorStyle.opacity
            }}
          />

          {/* Create button */}
          <Link
            href="/create"
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--bg-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl), var(--glow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
          >
            <span className="text-2xl font-light">＋</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}