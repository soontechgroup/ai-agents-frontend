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
    return httpClient.post<PaginatedResponse<User>>(
      `${this.basePath}/list`,
      params || {}
    );
  }

  /**
   * 获取单个用户
   */
  async getUserById(id: number): Promise<User> {
    return httpClient.post<User>(`${this.basePath}/detail`, { id });
  }

  /**
   * 创建用户（管理员）
   */
  async createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
    return httpClient.post<ApiResponse<User>>(
      `${this.basePath}/create`,
      data
    );
  }

  /**
   * 更新用户（管理员）
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<ApiResponse<User>> {
    return httpClient.post<ApiResponse<User>>(
      `${this.basePath}/update`,
      { id, ...data }
    );
  }

  /**
   * 删除用户（管理员）
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/delete`,
      { id }
    );
  }

}

export const userService = new UserService();