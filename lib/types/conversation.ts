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
  conversation_id: number;
  limit?: number;
}

export interface ConversationSendRequest {
  conversation_id: number;
  content: string;
}

export interface ConversationChatRequest {
  conversation_id: number;
  message: string;
  stream?: boolean;
}

export interface ConversationClearRequest {
  conversation_id: number;
}

export interface Conversation {
  id: number;
  user_id: number;
  digital_human_id: number;
  title?: string;
  thread_id: string;
  status: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
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