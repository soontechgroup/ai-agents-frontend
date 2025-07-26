import { BaseService } from '../base.service';
import { ApiResponse } from '@/lib/types/api';
import { DigitalHuman, ChatMessage, RecommendedTopic } from '@/lib/types/digital-human';

export interface SendMessageData {
  message: string;
  isVoice?: boolean;
}

export interface SendMessageResponse {
  reply: string;
  messageId: string;
}

class DigitalHumanService extends BaseService {
  // 获取数字人详情
  async getDigitalHuman(id: string): Promise<ApiResponse<DigitalHuman>> {
    return this.get<DigitalHuman>(`/digital-humans/${id}`);
  }

  // 获取数字人列表
  async getDigitalHumans(): Promise<ApiResponse<DigitalHuman[]>> {
    return this.get<DigitalHuman[]>('/digital-humans');
  }

  // 发送消息给数字人
  async sendMessage(
    digitalHumanId: string, 
    data: SendMessageData
  ): Promise<ApiResponse<SendMessageResponse>> {
    return this.post<SendMessageResponse>(
      `/digital-humans/${digitalHumanId}/chat`,
      data
    );
  }

  // 获取推荐话题
  async getRecommendedTopics(digitalHumanId: string): Promise<ApiResponse<RecommendedTopic[]>> {
    return this.get<RecommendedTopic[]>(`/digital-humans/${digitalHumanId}/topics`);
  }

  // 获取聊天历史
  async getChatHistory(digitalHumanId: string): Promise<ApiResponse<ChatMessage[]>> {
    return this.get<ChatMessage[]>(`/digital-humans/${digitalHumanId}/history`);
  }

  // 收藏/取消收藏数字人
  async toggleFavorite(digitalHumanId: string, isFavorited: boolean): Promise<ApiResponse<void>> {
    return this.post<void>(`/digital-humans/${digitalHumanId}/favorite`, { isFavorited });
  }
}

export const digitalHumanService = new DigitalHumanService();