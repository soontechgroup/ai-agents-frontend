'use client';

import Link from 'next/link';
import { Home, MessageCircle, BookOpen, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: <Home size={24} />, label: '首页' },
    { href: '/chat', icon: <MessageCircle size={24} />, label: '会话' },
    { href: '/books', icon: <BookOpen size={24} />, label: '书单' },
    { href: '/profile', icon: <User size={24} />, label: '我的' },
  ];

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
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                pathname === item.href 
                  ? 'text-[var(--accent-primary)]' 
                  : 'text-[var(--text-secondary)]'
              }`}
              style={{
                backgroundColor: pathname === item.href ? 'rgba(0, 217, 255, 0.1)' : 'transparent'
              }}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}

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