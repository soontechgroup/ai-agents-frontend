import { httpClient } from '@/lib/api/http-client';
import { User } from '@/lib/types';
import { ApiResponse, PaginatedResponse } from '@/lib/types/api';

export interface UserQueryParams {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  role?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

class UserService {
  private readonly basePath = '/api/v1/users';

  /**
   * 获取用户列表（管理员）
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>(
      this.basePath,
      { params }
    );
  }

  /**
   * 获取单个用户
   */
  async getUserById(id: number): Promise<User> {
    return httpClient.get<User>(`${this.basePath}/${id}`);
  }

  /**
   * 创建用户（管理员）
   */
  async createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
    return httpClient.post<ApiResponse<User>>(
      this.basePath,
      data
    );
  }

  /**
   * 更新用户（管理员）
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<ApiResponse<User>> {
    return httpClient.put<ApiResponse<User>>(
      `${this.basePath}/${id}`,
      data
    );
  }

  /**
   * 删除用户（管理员）
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
  }

  /**
   * 批量删除用户（管理员）
   */
  async deleteUsers(ids: number[]): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/batch-delete`,
      { ids }
    );
  }

  /**
   * 启用/禁用用户（管理员）
   */
  async toggleUserStatus(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    return httpClient.patch<ApiResponse<User>>(
      `${this.basePath}/${id}/status`,
      { is_active: isActive }
    );
  }

  /**
   * 重置用户密码（管理员）
   */
  async resetUserPassword(id: number, newPassword: string): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/${id}/reset-password`,
      { new_password: newPassword }
    );
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
  }>> {
    return httpClient.get<ApiResponse<any>>(
      `${this.basePath}/stats`
    );
  }
}

export const userService = new UserService();