import { httpClient } from '@/lib/api/http-client';
import { User, LoginResponse } from '@/lib/types';
import { ApiResponse } from '@/lib/types/api';

export interface RegisterDto {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  old_password: string;
  new_password: string;
}

class AuthService {
  private readonly basePath = '/api/v1/auth';

  /**
   * 用户注册
   */
  async register(data: RegisterDto): Promise<any> {
    return httpClient.post<any>(
      `${this.basePath}/register`,
      data
    );
  }

  /**
   * 用户登录
   */
  async login(data: LoginDto): Promise<any> {
    return httpClient.post<any>(
      `${this.basePath}/login`,
      data
    );
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<any> {
    return httpClient.post<any>(`${this.basePath}/current`, {});
  }


  /**
   * 登出（清除本地 token）
   */
  async logout(): Promise<void> {
    try {
      // 尝试调用后端的登出接口（如果存在）
      await httpClient.post(`${this.basePath}/logout`);
    } catch (error) {
      // 即使后端登出失败，也要清除本地存储
    }
    
    // 清除本地存储
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

}

export const authService = new AuthService();