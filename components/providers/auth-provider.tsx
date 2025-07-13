'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, BackendResponse, LoginResponse, AuthContextType } from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/api-config';

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
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // 设置 cookie 用于中间件
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
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
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      const data: BackendResponse<LoginResponse> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || '登录失败');
      }

      if (data.data?.access_token) {
        localStorage.setItem('token', data.data.access_token);
        
        // 设置 cookie
        document.cookie = `token=${data.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        
        // 获取用户信息
        await verifyToken();
        setSuccess('登录成功！');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '登录失败');
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
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          full_name,
        }),
      });

      const data: BackendResponse<User> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || '注册失败');
      }

      setSuccess('注册成功！请登录。');
    } catch (error) {
      setError(error instanceof Error ? error.message : '注册失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setSuccess('已成功登出');
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