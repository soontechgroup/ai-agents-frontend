'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

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

          <ul className="hidden lg:flex gap-8 list-none">
            <li>
              <Link 
                href="/" 
                className={`transition-colors relative ${
                  pathname === '/' 
                    ? 'text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                }`}
              >
                首页
                {pathname === '/' && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5" style={{
                    background: 'var(--accent-gradient)'
                  }} />
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/chat" 
                className={`transition-colors relative ${
                  pathname === '/chat' 
                    ? 'text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                }`}
              >
                会话
                {pathname === '/chat' && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5" style={{
                    background: 'var(--accent-gradient)'
                  }} />
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/personal" 
                className={`transition-colors relative ${
                  pathname === '/personal' 
                    ? 'text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                }`}
              >
                个人中心
                {pathname === '/personal' && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5" style={{
                    background: 'var(--accent-gradient)'
                  }} />
                )}
              </Link>
            </li>
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <span className="text-[var(--text-secondary)]">欢迎, {user?.username}</span>
            <button
              onClick={() => {
                console.log('Logout button clicked');
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
              <li>
                <Link 
                  href="/" 
                  className={`block ${
                    pathname === '/' 
                      ? 'text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                  }`}
                >
                  首页
                </Link>
              </li>
              <li>
                <Link 
                  href="/chat" 
                  className={`block ${
                    pathname === '/chat' 
                      ? 'text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                  }`}
                >
                  会话
                </Link>
              </li>
              <li>
                <Link 
                  href="/personal" 
                  className={`block ${
                    pathname === '/personal' 
                      ? 'text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                  }`}
                >
                  个人中心
                </Link>
              </li>
              <li className="pt-4 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">{user?.username}</span>
                  <button
                    onClick={() => {
                      console.log('Mobile logout button clicked');
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