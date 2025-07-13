# API 封装使用指南

## 基本使用

### 1. 在组件中使用 API

```typescript
import { authService, userService } from '@/lib/api';

// 登录示例
const handleLogin = async () => {
  try {
    const response = await authService.login({
      username: 'user@example.com',
      password: 'password123'
    });
    
    // Token 会自动保存到 localStorage
    console.log('登录成功', response.data);
  } catch (error) {
    console.error('登录失败', error);
  }
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const users = await userService.getUsers({
      page: 1,
      size: 20,
      search: 'john'
    });
    console.log('用户列表', users);
  } catch (error) {
    console.error('获取失败', error);
  }
};
```

### 2. 在 React Hook 中使用

```typescript
import { useState, useEffect } from 'react';
import { userService } from '@/lib/api';
import { User } from '@/lib/types';

export function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserById(userId);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}
```

### 3. 自定义请求

```typescript
import { httpClient } from '@/lib/api';

// 自定义 GET 请求
const customGet = async () => {
  const data = await httpClient.get('/api/v1/custom-endpoint', {
    params: { filter: 'active' }
  });
  return data;
};

// 自定义 POST 请求
const customPost = async (payload: any) => {
  const data = await httpClient.post('/api/v1/custom-endpoint', payload);
  return data;
};

// 文件上传
const uploadFile = async (file: File) => {
  const data = await httpClient.uploadFile(
    '/api/v1/upload',
    file,
    'avatar' // 字段名
  );
  return data;
};
```

## 高级功能

### 1. 请求拦截器

```typescript
import HttpClient from '@/lib/api/http-client';
import { createAuthInterceptor, createLoggerInterceptor } from '@/lib/api/interceptors';

// 创建自定义客户端
const customClient = new HttpClient();

// 添加拦截器
customClient.addRequestInterceptor(createAuthInterceptor());
customClient.addResponseInterceptor(createLoggerInterceptor());
```

### 2. 错误处理

```typescript
import { ApiError } from '@/lib/types/api';

try {
  await authService.login(credentials);
} catch (error) {
  const apiError = error as ApiError;
  
  switch (apiError.status) {
    case 401:
      // 未授权
      console.log('请重新登录');
      break;
    case 400:
      // 请求错误
      console.log('请检查输入信息');
      break;
    case 500:
      // 服务器错误
      console.log('服务器出错，请稍后重试');
      break;
    default:
      console.log(apiError.message);
  }
}
```

### 3. 请求缓存

```typescript
import { createCacheInterceptor } from '@/lib/api/interceptors';

const cache = createCacheInterceptor(5 * 60 * 1000); // 5分钟缓存

// 使用缓存
const getCachedData = async (key: string) => {
  // 先检查缓存
  const cached = cache.get(key);
  if (cached) return cached;
  
  // 缓存未命中，发起请求
  const data = await httpClient.get('/api/v1/data');
  cache.set(key, data);
  
  return data;
};
```

### 4. 请求重试

```typescript
import { createRetryInterceptor } from '@/lib/api/interceptors';

const retry = createRetryInterceptor({
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => error.status >= 500
});

// 使用重试
const fetchWithRetry = async () => {
  return retry(() => httpClient.get('/api/v1/unstable-endpoint'));
};
```

## 类型安全

API 服务已经提供了完整的 TypeScript 类型支持：

```typescript
// 自动类型推导
const response = await authService.login({ username, password });
// response.data 的类型是 LoginResponse

const users = await userService.getUsers();
// users 的类型是 PaginatedResponse<User>
```

## 最佳实践

1. **错误处理**：始终使用 try-catch 处理 API 调用
2. **加载状态**：在 UI 中显示加载状态
3. **缓存数据**：对频繁请求的数据使用缓存
4. **取消请求**：组件卸载时取消未完成的请求
5. **类型安全**：充分利用 TypeScript 类型

## 扩展 API 服务

如需添加新的 API 服务：

1. 在 `lib/api/services/` 创建新的服务文件
2. 继承基础的模式和类型
3. 在 `lib/api/index.ts` 导出新服务

```typescript
// lib/api/services/product.service.ts
class ProductService {
  private readonly basePath = '/api/v1/products';
  
  async getProducts() {
    return httpClient.get(this.basePath);
  }
  
  // ... 其他方法
}

export const productService = new ProductService();
```