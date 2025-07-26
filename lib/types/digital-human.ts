// 数字人信息
export interface DigitalHuman {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: 'online' | 'offline';
  chats: number;
  likes?: number;
  rating?: number;
  specialties?: string[];
  topics?: string[];
  imageUrl?: string;
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