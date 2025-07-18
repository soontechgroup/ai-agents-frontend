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
    return httpClient.get<any>(`${this.basePath}/me`);
  }

  /**
   * 更新用户信息
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return httpClient.put<ApiResponse<User>>(
      `${this.basePath}/me`,
      data
    );
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/change-password`,
      data
    );
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
      console.log('Backend logout failed, clearing local storage');
    }
    
    // 清除本地存储
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  /**
   * 刷新 token（如果后端支持）
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<ApiResponse<LoginResponse>>(
      `${this.basePath}/refresh`,
      {},
      { withAuth: true }
    );
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/send-code`,
      { phone }
    );
  }

  /**
   * 验证手机号
   */
  async verifyPhone(phone: string, code: string): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/verify-phone`,
      { phone, code }
    );
  }

  /**
   * 重置密码（忘记密码）
   */
  async resetPassword(email: string): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/reset-password`,
      { email }
    );
  }

  /**
   * 确认重置密码
   */
  async confirmResetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/reset-password/confirm`,
      { token, new_password: newPassword }
    );
  }
}

export const authService = new AuthService();