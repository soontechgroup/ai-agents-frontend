// API 响应的通用类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: string;
  success?: boolean;
  error?: string;
  detail?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// API 错误类型
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

// 请求配置
export interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  withAuth?: boolean;
}