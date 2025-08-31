'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginResponse, AuthContextType } from '@/lib/types';
import { authService } from '@/lib/api';
import { ApiError } from '@/lib/types/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 自动清除消息
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // 验证 token
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      // 处理后端响应格式
      if (response.data) {
        setUser(response.data);
      } else if (response.id) {
        // 如果直接返回用户数据
        setUser(response);
      }
      
      // 设置 cookie 用于中间件
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      document.cookie = `token=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时验证 token
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // 登录
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.login({ email, password });

      if (response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // 设置 cookie - 使用更可靠的设置
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1); // 1天后过期
        document.cookie = `token=${response.data.access_token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
        
        // 获取用户信息
        await verifyToken();
        setSuccess('登录成功！');
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || '登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (email: string, password: string, full_name?: string) => {
    console.log('AuthProvider register called with:', { email, full_name });
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('调用 authService.register...');
      const response = await authService.register({
        email,
        password,
        full_name,
      });
      
      console.log('注册API响应:', response);

      // 检查响应是否成功
      if (response.code === 200 || response.data) {
        setSuccess('注册成功！正在自动登录...');
        
        // 注册成功后自动登录
        try {
          const loginResponse = await authService.login({ email, password });
          
          if (loginResponse.data?.access_token) {
            localStorage.setItem('token', loginResponse.data.access_token);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);
            document.cookie = `token=${loginResponse.data.access_token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
            
            // 获取用户信息
            await verifyToken();
            setSuccess('注册成功，已自动登录！');
            
            // 返回成功，让页面处理跳转
            return { success: true };
          }
        } catch (loginError) {
          // 如果自动登录失败，仍然算注册成功
          console.error('Auto login failed:', loginError);
          setSuccess('注册成功！请手动登录。');
        }
      } else {
        setError(response.message || '注册失败');
      }
    } catch (error) {
      console.error('注册异常:', error);
      const apiError = error as ApiError;
      setError(apiError.message || '注册失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = useCallback(async () => {
    try {
      console.log('Logout called in AuthProvider');
      setLoading(true);
      
      // 调用 auth service 的 logout
      await authService.logout();
      
      // 清除用户状态
      setUser(null);
      setSuccess('已成功登出');
      
      console.log('User cleared, redirecting to login page');
      
      // 使用 window.location 进行硬跳转，确保所有状态被清除
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setError('登出失败，请重试');
      // 即使出错也要清除本地数据
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }, []);

  // 重置消息
  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        resetMessages,
        error,
        success,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}