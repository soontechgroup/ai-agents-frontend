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
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
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
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.login({ username, password });

      if (response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // 设置 cookie
        document.cookie = `token=${response.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        
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
  const register = async (username: string, email: string, password: string, full_name?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.register({
        username,
        email,
        password,
        full_name,
      });

      // 检查响应是否成功
      if (response.code === 200 || response.data) {
        setSuccess('注册成功！正在自动登录...');
        
        // 注册成功后自动登录
        try {
          const loginResponse = await authService.login({ username, password });
          
          if (loginResponse.data?.access_token) {
            localStorage.setItem('token', loginResponse.data.access_token);
            document.cookie = `token=${loginResponse.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
            
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
      const apiError = error as ApiError;
      setError(apiError.message || '注册失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setSuccess('已成功登出');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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