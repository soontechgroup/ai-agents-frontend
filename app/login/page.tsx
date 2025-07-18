'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  
  const { login, error, success, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (error) {
      // 错误已在 AuthProvider 中处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 网格背景 */}
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
      
      {/* 动态背景效果 */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full -top-[300px] -right-[300px]"
        style={{
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite'
        }}
      />
      <div 
        className="fixed w-[400px] h-[400px] rounded-full -bottom-[200px] -left-[200px]"
        style={{
          background: 'radial-gradient(circle, rgba(123, 104, 238, 0.1) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite reverse'
        }}
      />

      <div className="w-full max-w-[480px] px-8 z-10">
        {/* Logo区域 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 gradient-text">AI Assistant</h1>
          <p className="text-[var(--text-secondary)]">欢迎回来</p>
        </div>

        {/* 登录表单卡片 */}
        <div 
          className="relative rounded-[20px] p-10 backdrop-blur-[20px]"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {/* 渐变边框效果 */}
          <div 
            className="absolute inset-[-2px] rounded-[20px] opacity-50 pointer-events-none"
            style={{
              background: 'var(--accent-gradient)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '2px'
            }}
          />

          <h2 className="text-[1.75rem] font-semibold text-center mb-8 text-[var(--text-primary)]">登录账户</h2>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 rounded-[10px] bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          {/* 成功提示 */}
          {success && (
            <div className="mb-6 p-4 rounded-[10px] bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                required
                disabled={loading}
                className="w-full px-4 py-3.5 rounded-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none focus:ring-0"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1), var(--glow-sm)';
                  e.target.style.backgroundColor = 'rgba(26, 26, 46, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.boxShadow = '';
                  e.target.style.backgroundColor = 'var(--bg-secondary)';
                }}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 pr-12 rounded-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300 focus:outline-none focus:ring-0"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1), var(--glow-sm)';
                    e.target.style.backgroundColor = 'rgba(26, 26, 46, 0.8)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-default)';
                    e.target.style.boxShadow = '';
                    e.target.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-[18px] h-[18px] rounded accent-[var(--accent-primary)] cursor-pointer"
                />
                <span className="text-sm text-[var(--text-secondary)]">记住我</span>
              </label>
              <Link 
                href="#" 
                className="text-sm text-[var(--accent-primary)] hover:opacity-80 hover:underline transition-all"
              >
                忘记密码？
              </Link>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[10px] font-semibold text-lg transition-all duration-300 relative overflow-hidden btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--glow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 第三方登录部分 */}
          <div className="mt-8">
            {/* 分割线 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[var(--border-default)]" />
              <span className="text-sm text-[var(--text-muted)]">其他登录方式</span>
              <div className="flex-1 h-px bg-[var(--border-default)]" />
            </div>

            {/* 第三方登录按钮 */}
            <div className="grid grid-cols-3 gap-4">
              <button
                className="p-3.5 rounded-[10px] flex items-center justify-center text-xl transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = '';
                }}
                title="Google登录"
              >
                🔍
              </button>
              <button
                className="p-3.5 rounded-[10px] flex items-center justify-center text-xl transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = '';
                }}
                title="GitHub登录"
              >
                🐙
              </button>
              <button
                className="p-3.5 rounded-[10px] flex items-center justify-center text-xl transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = '';
                }}
                title="邮箱登录"
              >
                📧
              </button>
            </div>
          </div>

          {/* 注册链接 */}
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            还没有账户？
            <Link 
              href="/register" 
              className="text-[var(--accent-primary)] font-medium ml-1 hover:underline"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}