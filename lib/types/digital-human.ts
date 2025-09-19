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
  is_active?: boolean;  // 模板是否启用
  is_public?: boolean;  // 是否公开模板
  chats?: number;
  likes?: number;
  rating?: number;
  specialties?: string[];
  topics?: string[];
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
  // 权限相关字段
  canAccess?: boolean;  // 是否可访问
  accessLevel?: 'view' | 'chat' | 'edit' | 'owner';  // 访问级别
  isOwner?: boolean;  // 是否是创建者
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
  include_public?: boolean;
}

// 分页响应
export interface DigitalHumanPageResponse {
  code: number;
  message: string;
  data: DigitalHuman[];
  pagination: PaginationMeta;
}

// 训练相关类型
export interface TrainingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  extractedKnowledge?: ExtractedKnowledge;
}

export interface ExtractedKnowledge {
  entities: Array<{
    name: string;
    type: string;
    properties?: Record<string, any>;
  }>;
  relationships: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export interface ThinkingStep {
  stage: string;
  detail: string;
  timestamp?: string;
}

export interface TrainingEvent {
  type: 'user_message' | 'assistant_question' | 'thinking' | 'node_start' | 'node_complete' | 'knowledge_extracted' | 'memory_found' | 'error';
  content?: string;  // 主要内容
  node?: string;  // 节点名称（node_start, node_complete 等事件使用）
  message?: string;  // 消息内容（某些事件使用）
  timestamp?: string;  // 时间戳
  result?: any;  // 结果数据
  metadata?: {  // 额外信息
    id?: number;
    entities?: any[];
    entities_count?: number;
    relationships_count?: number;
    [key: string]: any;
  };
}

export interface TrainingProgress {
  conversationRounds: number;
  effectiveTraining: number;
  trainingQuality: 'excellent' | 'good' | 'average' | 'poor';
  progressPercentage: number;
}

export interface TrainingState {
  isTraining: boolean;
  currentStage?: string;
  thinkingSteps: ThinkingStep[];
  messages: TrainingMessage[];
  progress: TrainingProgress;
}

// 训练消息历史相关类型
export interface TrainingMessagesRequest {
  digital_human_id: number;
  page?: number;
  size?: number;
}

export interface TrainingMessageFromAPI {
  id: number;
  role: string;
  content: string;
  extracted_knowledge?: Record<string, any> | null;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface TrainingMessagesPageResponse {
  code: number;
  message: string;
  data: TrainingMessageFromAPI[];
  pagination: PaginationMeta;
}