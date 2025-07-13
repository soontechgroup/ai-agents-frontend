'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { EyeIcon, EyeOffIcon } from '@/components/icons/eye-icon';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    verifyCode: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    agreement: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isRippling, setIsRippling] = useState(false);
  
  const { register, error, success, loading } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // 清除对应字段的错误
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) errors.username = '请输入用户名';
    if (!formData.email) errors.email = '请输入邮箱地址';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = '请输入有效的邮箱地址';
    if (!formData.phone) errors.phone = '请输入手机号';
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) errors.phone = '请输入有效的手机号';
    if (!formData.verifyCode) errors.verifyCode = '请输入验证码';
    if (!formData.password) errors.password = '请设置密码';
    if (formData.password.length < 8 || formData.password.length > 20) {
      errors.password = '密码长度需要在8-20位之间';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    if (!formData.agreement) errors.agreement = '请同意用户协议';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGetVerifyCode = () => {
    if (countdown > 0) return;
    
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setFormErrors({ ...formErrors, phone: '请输入有效的手机号' });
      return;
    }
    
    // 模拟发送验证码
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // 暂时将手机号存储在 full_name 字段中（后续需要后端支持）
      const fullNameWithPhone = formData.full_name ? 
        `${formData.full_name} (${formData.phone})` : 
        `手机号: ${formData.phone}`;
        
      await register(
        formData.username,
        formData.email,
        formData.password,
        fullNameWithPhone
      );
      
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      // 错误已在 AuthProvider 中处理
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center relative overflow-hidden">
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
      <div className="fixed w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,217,255,0.1)_0%,transparent_70%)] -top-[300px] -right-[300px] animate-float" />
      <div className="fixed w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(123,104,238,0.1)_0%,transparent_70%)] -bottom-[200px] -left-[200px] animate-float-reverse" />

      <div className="w-full max-w-[480px] px-8 py-8 z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-[40px] font-bold bg-accent-gradient bg-clip-text text-transparent mb-2">
            AI Assistant
          </h1>
          <p className="text-[#B8BCC8] text-base">开启您的AI之旅</p>
        </div>

        {/* 注册表单卡片 */}
        <div className="relative">
          {/* 渐变边框效果 */}
          <div 
            className="absolute inset-[-2px] rounded-[20px] bg-accent-gradient opacity-50"
            style={{
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              padding: '2px',
            }}
          />
          
          <div className="relative bg-[#16213E] border border-white/10 rounded-[20px] p-10 backdrop-blur-[20px]" 
               style={{ boxShadow: '0 20px 25px rgba(0, 217, 255, 0.2)' }}>
            
            <h2 className="text-[28px] font-semibold text-center mb-8 text-[#F5F5F5]">创建账户</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[10px] text-[#EE5A6F] text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-[10px] text-[#00F5A0] text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 用户名 */}
              <div className={`mb-6 ${formErrors.username ? 'error' : ''}`}>
                <label className="block text-sm text-[#B8BCC8] mb-2 font-medium">
                  用户名
                </label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-[14px] bg-[#1A1A2E] border ${
                    formErrors.username ? 'border-[#EE5A6F]' : 'border-white/10'
                  } rounded-[10px] text-[#F5F5F5] placeholder:text-[#6C7293] text-base focus:outline-none focus:border-[#00D9FF] focus:bg-[#1A1A2E]/80 focus:input-focus transition-all duration-300`}
                  placeholder="请输入用户名"
                  disabled={loading}
                />
                {formErrors.username && (
                  <span className="text-[#EE5A6F] text-xs mt-1 block">{formErrors.username}</span>
                )}
              </div>

              {/* 邮箱 */}
              <div className={`mb-6 ${formErrors.email ? 'error' : ''}`}>
                <label className="block text-sm text-[#B8BCC8] mb-2 font-medium">
                  邮箱
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-[14px] bg-[#1A1A2E] border ${
                    formErrors.email ? 'border-[#EE5A6F]' : 'border-white/10'
                  } rounded-[10px] text-[#F5F5F5] placeholder:text-[#6C7293] text-base focus:outline-none focus:border-[#00D9FF] focus:bg-[#1A1A2E]/80 focus:input-focus transition-all duration-300`}
                  placeholder="请输入邮箱地址"
                  disabled={loading}
                />
                {formErrors.email && (
                  <span className="text-[#EE5A6F] text-xs mt-1 block">{formErrors.email}</span>
                )}
              </div>

              {/* 手机号 */}
              <div className={`mb-6 ${formErrors.phone ? 'error' : ''}`}>
                <label className="block text-sm text-[#B8BCC8] mb-2 font-medium">
                  手机号
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-[14px] bg-[#1A1A2E] border ${
                    formErrors.phone ? 'border-[#EE5A6F]' : 'border-white/10'
                  } rounded-[10px] text-[#F5F5F5] placeholder:text-[#6C7293] text-base focus:outline-none focus:border-[#00D9FF] focus:bg-[#1A1A2E]/80 focus:input-focus transition-all duration-300`}
                  placeholder="请输入手机号"
                  disabled={loading}
                />
                {formErrors.phone && (
                  <span className="text-[#EE5A6F] text-xs mt-1 block">{formErrors.phone}</span>
                )}
              </div>

              {/* 验证码 */}
              <div className={`mb-6 ${formErrors.verifyCode ? 'error' : ''}`}>
                <label className="block text-sm text-[#B8BCC8] mb-2 font-medium">
                  验证码
                </label>
                <div className="flex gap-4">
                  <input
                    name="verifyCode"
                    type="text"
                    value={formData.verifyCode}
                    onChange={handleChange}
                    className={`flex-1 px-4 py-[14px] bg-[#1A1A2E] border ${
                      formErrors.verifyCode ? 'border-[#EE5A6F]' : 'border-white/10'
                    } rounded-[10px] text-[#F5F5F5] placeholder:text-[#6C7293] text-base focus:outline-none focus:border-[#00D9FF] focus:bg-[#1A1A2E]/80 focus:input-focus transition-all duration-300`}
                    placeholder="请输入验证码"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleGetVerifyCode}
                    disabled={countdown > 0 || loading}
                    className={`px-6 py-[14px] bg-transparent border border-[#00D9FF] rounded-[10px] text-[#00D9FF] font-medium transition-all duration-300 whitespace-nowrap ${
                      countdown > 0 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00D9FF]/10 hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] cursor-pointer'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
                  </button>
                </div>
                {formErrors.verifyCode && (
                  <span className="text-[#EE5A6F] text-xs mt-1 block">{formErrors.verifyCode}</span>
                )}
              </div>

              {/* 密码 */}
              <div className={`mb-6 ${formErrors.password ? 'error' : ''}`}>
                <label className="block text-sm text-[#B8BCC8] mb-2 font-medium">
                  密码
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-[14px] pr-12 bg-[#1A1A2E] border ${
                      formErrors.password ? 'border-[#EE5A6F]' : 'border-white/10'
                    } rounded-[10px] text-[#F5F5F5] placeholder:text-[#6C7293] text-base focus:outline-none focus:border-[#00D9FF] focus:bg-[#1A1A2E]/80 focus:input-focus transition-all duration-300`}
                    placeholder="请设置密码（8-20位）"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C7293] hover:text-[#B8BCC8] transition-colors duration-300 p-1"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="text-[#EE5A6F] text-xs mt-1 block">{formErrors.password}</span>
                )}
              </div>

              {/* 确认密码 */}
              <div className={`mb-6 ${formErrors.confirmPassword ? 'error' : ''}`}>
                <label className="block text-sm text-[#B8BCC8] mb-2 font-medium">
                  确认密码
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-[14px] pr-12 bg-[#1A1A2E] border ${
                      formErrors.confirmPassword ? 'border-[#EE5A6F]' : 'border-white/10'
                    } rounded-[10px] text-[#F5F5F5] placeholder:text-[#6C7293] text-base focus:outline-none focus:border-[#00D9FF] focus:bg-[#1A1A2E]/80 focus:input-focus transition-all duration-300`}
                    placeholder="请再次输入密码"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C7293] hover:text-[#B8BCC8] transition-colors duration-300 p-1"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span className="text-[#EE5A6F] text-xs mt-1 block">{formErrors.confirmPassword}</span>
                )}
              </div>

              {/* 用户协议 */}
              <div className="flex items-start gap-3 mb-8">
                <input
                  name="agreement"
                  type="checkbox"
                  checked={formData.agreement}
                  onChange={handleChange}
                  className="w-[18px] h-[18px] mt-0.5 accent-[#00D9FF] cursor-pointer"
                  disabled={loading}
                />
                <label className="text-sm text-[#B8BCC8] leading-relaxed">
                  我已阅读并同意
                  <Link href="#" className="text-[#00D9FF] hover:opacity-80 hover:underline transition-opacity duration-300">
                    《用户服务协议》
                  </Link>
                  和
                  <Link href="#" className="text-[#00D9FF] hover:opacity-80 hover:underline transition-opacity duration-300">
                    《隐私政策》
                  </Link>
                </label>
              </div>
              {formErrors.agreement && (
                <span className="text-[#EE5A6F] text-xs -mt-6 mb-4 block">{formErrors.agreement}</span>
              )}

              {/* 注册按钮 */}
              <button
                type="submit"
                disabled={loading || !formData.agreement}
                className={`w-full py-4 bg-accent-gradient rounded-[10px] text-[#0A1628] text-base font-semibold transition-all duration-300 relative overflow-hidden ${
                  loading || !formData.agreement 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:-translate-y-0.5 hover:shadow-[0_10px_15px_rgba(0,217,255,0.15),0_0_20px_rgba(0,217,255,0.4)] cursor-pointer'
                }`}
                style={{
                  boxShadow: loading || !formData.agreement ? '' : '0 4px 6px rgba(0, 217, 255, 0.1)'
                }}
                onMouseDown={() => setIsRippling(true)}
                onAnimationEnd={() => setIsRippling(false)}
              >
                <span className="relative z-10">{loading ? '注册中...' : '注册'}</span>
                {/* 点击波纹效果 */}
                <span 
                  className={`absolute inset-0 bg-white/30 rounded-[10px] ${
                    isRippling ? 'animate-[ripple_500ms_ease-in-out]' : ''
                  }`}
                  style={{
                    transform: isRippling ? 'scale(2)' : 'scale(0)',
                    transformOrigin: 'center',
                    transition: isRippling ? 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                  }}
                />
              </button>
            </form>

            {/* 分割线 */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[#6C7293] text-sm">或</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* 第三方登录 */}
            <div className="flex gap-4 mb-8">
              <button className="flex-1 py-[14px] bg-transparent border border-white/10 rounded-[10px] flex items-center justify-center gap-2 hover:border-[#00D9FF] hover:bg-[#00D9FF]/5 transition-all duration-300 text-[#F5F5F5] text-sm">
                <span>📱</span>
                <span>微信登录</span>
              </button>
              <button className="flex-1 py-[14px] bg-transparent border border-white/10 rounded-[10px] flex items-center justify-center gap-2 hover:border-[#00D9FF] hover:bg-[#00D9FF]/5 transition-all duration-300 text-[#F5F5F5] text-sm">
                <span>📧</span>
                <span>邮箱登录</span>
              </button>
            </div>

            {/* 登录链接 */}
            <p className="text-center text-[#B8BCC8] text-sm">
              已有账户？
              <Link href="/login" className="text-[#00D9FF] font-medium hover:underline ml-1">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}