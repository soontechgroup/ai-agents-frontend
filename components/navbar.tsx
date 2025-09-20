'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0
  });
  const navRef = useRef<HTMLUListElement>(null);
  const isMountedRef = useRef(false);
  const [enableTransition, setEnableTransition] = useState(false);

  // 导航项配置
  const navItems = [
    { href: '/', label: '首页' },
    { href: '/conversations', label: '会话' },
    { href: '/personal', label: '个人中心' }
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

    const items = navRef.current.querySelectorAll('li');
    const activeItem = items[activeIndex];
    if (activeItem) {
      const link = activeItem.querySelector('a');
      if (link) {
        // 小延迟确保 DOM 渲染完成
        requestAnimationFrame(() => {
          const rect = link.getBoundingClientRect();
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
    }

    isMountedRef.current = true;
  }, [pathname]);

  // 窗口大小变化时更新位置
  useEffect(() => {
    const handleResize = () => {
      if (!navRef.current) return;

      const activeIndex = navItems.findIndex(item => item.href === pathname);
      if (activeIndex === -1) return;

      const items = navRef.current.querySelectorAll('li');
      const activeItem = items[activeIndex];
      if (activeItem) {
        const link = activeItem.querySelector('a');
        if (link) {
          const rect = link.getBoundingClientRect();
          const navRect = navRef.current.getBoundingClientRect();

          setIndicatorStyle({
            left: rect.left - navRect.left,
            width: rect.width,
            opacity: 1
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-[100] backdrop-blur-[20px]" style={{
      backgroundColor: 'rgba(26, 26, 46, 0.8)',
      borderBottom: '1px solid var(--border-default)'
    }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-semibold gradient-text">
            AI Assistant
          </Link>

          <ul ref={navRef} className="hidden lg:flex gap-8 list-none relative">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-2 transition-colors ${
                    pathname === item.href
                      ? 'text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* 动画指示器 - 放在导航项下方 */}
            <div
              className={`absolute -bottom-2 h-0.5 ${enableTransition ? 'transition-all duration-300 ease-out' : ''}`}
              style={{
                background: 'var(--accent-gradient)',
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity
              }}
            />
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <span className="text-[var(--text-secondary)]">欢迎, {user?.username}</span>
            <button
              onClick={() => {
                logout();
              }}
              className="px-4 py-2 rounded-lg text-[var(--text-primary)] transition-all duration-300"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-default)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = 'var(--glow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              退出
            </button>
          </div>

          <button
            className="lg:hidden text-[var(--text-primary)] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-[var(--border-default)] pt-4">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block relative px-3 py-2 rounded-lg transition-all ${
                      pathname === item.href
                        ? 'text-[var(--accent-primary)] bg-[rgba(0,217,255,0.1)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                        style={{ background: 'var(--accent-gradient)' }}
                      />
                    )}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">{user?.username}</span>
                  <button
                    onClick={() => {
                      logout();
                    }}
                    className="text-[var(--accent-primary)] hover:underline"
                  >
                    退出
                  </button>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}