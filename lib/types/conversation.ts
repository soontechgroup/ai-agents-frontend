export interface ConversationCreate {
  digital_human_id: number;
  title?: string;
}

export interface ConversationPageRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: 'active' | 'archived' | 'deleted';
}

export interface ConversationDetailRequest {
  id: number;
}

export interface ConversationUpdateRequest {
  id: number;
  title?: string;
  status?: 'active' | 'archived' | 'deleted';
}

export interface ConversationDeleteRequest {
  id: number;
}

export interface ConversationMessagesRequest {
  digital_human_id: number;
  limit?: number;
}

export interface ConversationSendRequest {
  digital_human_id: number;
  content: string;
}

export interface ConversationChatRequest {
  digital_human_id: number;
  message: string;
  stream?: boolean;
}

export interface ConversationClearRequest {
  digital_human_id: number;
}

export interface Conversation {
  user_id: number;
  digital_human_id: number;
  title?: string;
  last_message_at?: string;
  created_at: string;
}

export interface Message {
  id: number;
  digital_human_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'memory' | 'thinking' | 'knowledge';  // 消息类型
  metadata?: {  // 额外信息
    count?: number;
    has_memory?: boolean;
    entities?: any[];
    [key: string]: any;
  };
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationPageResponse {
  code: number;
  message: string;
  data?: Conversation[];
  timestamp: string;
  success: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
    total_pages: number;
  };
}