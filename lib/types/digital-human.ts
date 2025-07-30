// 数字人信息
export interface DigitalHuman {
  id: number;
  name: string;
  short_description?: string;
  detailed_description?: string;
  type?: string;
  skills?: string[];
  personality?: Record<string, any>;
  conversation_style?: string;
  temperature?: number;
  max_tokens?: number;
  avatar?: string;
  status?: 'online' | 'offline';
  chats?: number;
  likes?: number;
  rating?: number;
  specialties?: string[];
  topics?: string[];
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
}

// 创建数字人请求
export interface DigitalHumanCreate {
  name: string;
  short_description?: string;
  detailed_description?: string;
  type?: string;
  skills?: string[];
  personality?: Record<string, any>;
  conversation_style?: string;
  temperature?: number;
  max_tokens?: number;
}

// 更新数字人请求
export interface DigitalHumanUpdate {
  name?: string;
  short_description?: string;
  detailed_description?: string;
  type?: string;
  skills?: string[];
  personality?: Record<string, any>;
  conversation_style?: string;
  temperature?: number;
  max_tokens?: number;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

// 聊天会话
export interface ChatSession {
  id: string;
  digitalHumanId: string;
  userId: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  isFavorited?: boolean;
}

// 推荐话题
export interface RecommendedTopic {
  id: string;
  text: string;
  icon?: string;
}

// 分页信息
export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
}

// 分页请求参数
export interface DigitalHumanPageRequest {
  page?: number;
  size?: number;
  search?: string;
}

// 分页响应
export interface DigitalHumanPageResponse {
  code: number;
  message: string;
  data: DigitalHuman[];
  pagination: PaginationMeta;
}