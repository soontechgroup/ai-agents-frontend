// 导出所有 API 服务
export { authService } from './services/auth.service';
export { userService } from './services/user.service';
export { digitalHumanService } from './services/digital-human.service';

// 导出 HTTP 客户端（用于自定义请求）
export { httpClient, default as HttpClient } from './http-client';

// 导出所有服务的类型
export type { RegisterDto, LoginDto, ChangePasswordDto } from './services/auth.service';
export type { UserQueryParams, CreateUserDto, UpdateUserDto } from './services/user.service';
export type { SendMessageData, SendMessageResponse } from './services/digital-human.service';