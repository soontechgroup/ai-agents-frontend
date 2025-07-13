import { ApiError } from '@/lib/types/api';

// 请求拦截器类型
export type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;

// 响应拦截器类型
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

// 错误拦截器类型
export type ErrorInterceptor = (error: ApiError) => void | Promise<void>;

// Token 刷新函数类型
export type TokenRefreshFunction = () => Promise<string>;

/**
 * 请求重试配置
 */
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
}

/**
 * 创建认证拦截器
 */
export function createAuthInterceptor(): RequestInterceptor {
  return (config: RequestInit) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  };
}

/**
 * 创建日志拦截器
 */
export function createLoggerInterceptor(): ResponseInterceptor {
  return async (response: Response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.status} ${response.url}`);
    }
    return response;
  };
}

/**
 * 创建错误处理拦截器
 */
export function createErrorInterceptor(
  onUnauthorized?: () => void,
  onServerError?: (error: ApiError) => void
): ErrorInterceptor {
  return (error: ApiError) => {
    // 401 未授权
    if (error.status === 401) {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        // 默认行为：跳转到登录页
        window.location.href = '/login';
      }
    }

    // 500+ 服务器错误
    if (error.status && error.status >= 500) {
      console.error('[API] Server Error:', error);
      if (onServerError) {
        onServerError(error);
      }
    }

    // 显示错误提示（可以集成 toast 组件）
    if (error.message && process.env.NODE_ENV === 'development') {
      console.error('[API] Error:', error.message);
    }
  };
}

/**
 * 创建重试拦截器
 */
export function createRetryInterceptor(config: RetryConfig = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error) => error.status ? error.status >= 500 : false
  } = config;

  return async function retry<T>(
    request: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      const apiError = error as ApiError;
      
      if (retryCount < maxRetries && retryCondition(apiError)) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return retry(request, retryCount + 1);
      }
      
      throw error;
    }
  };
}

/**
 * 创建缓存拦截器（用于 GET 请求）
 */
export function createCacheInterceptor(ttl: number = 5 * 60 * 1000) {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return {
    get: <T>(key: string): T | null => {
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
      cache.delete(key);
      return null;
    },
    set: (key: string, data: any) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    clear: () => cache.clear()
  };
}