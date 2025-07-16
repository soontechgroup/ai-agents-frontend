import { ApiResponse, ApiError, RequestConfig } from '@/lib/types/api';

class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // 获取 token
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  // 构建完整的 URL
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }
    
    return url.toString();
  }

  // 处理响应
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw this.createError(data, response.status);
      }
      
      return data;
    }
    
    if (!response.ok) {
      throw this.createError(
        { message: `HTTP Error ${response.status}: ${response.statusText}` },
        response.status
      );
    }
    
    return response.text() as unknown as T;
  }

  // 创建错误对象
  private createError(data: any, status: number): ApiError {
    return {
      message: data.error || data.detail || data.message || 'An error occurred',
      status,
      details: data,
    };
  }

  // 请求方法
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      params,
      headers = {},
      withAuth = true,
      timeout = 30000,
      ...restConfig
    } = config;

    // 构建请求头 - 安全地处理 headers
    const requestHeaders = new Headers(this.defaultHeaders);
    
    // 合并传入的 headers
    if (headers) {
      const headersObj = new Headers(headers);
      headersObj.forEach((value, key) => {
        requestHeaders.set(key, value);
      });
    }

    // 添加认证 token
    if (withAuth) {
      const token = this.getToken();
      if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      ...restConfig,
      headers: requestHeaders,
    };

    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestConfig.signal = controller.signal;

    try {
      const response = await fetch(
        this.buildURL(endpoint, params),
        requestConfig
      );
      
      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw { message: 'Request timeout', status: 408 } as ApiError;
        }
      }
      
      throw error;
    }
  }

  // 便捷方法
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // 特殊方法：处理表单数据
  async postForm<T = any>(
    endpoint: string,
    data: Record<string, string>,
    config?: RequestConfig
  ): Promise<T> {
    const formData = new URLSearchParams(data);
    
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  }

  // 文件上传
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    config?: RequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
      },
      body: formData,
    });
  }
}

// 创建默认实例
export const httpClient = new HttpClient();

// 导出类以供创建自定义实例
export default HttpClient;