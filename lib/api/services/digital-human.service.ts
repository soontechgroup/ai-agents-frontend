import { httpClient } from '@/lib/api/http-client';
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

class DigitalHumanService {
  // 获取数字人详情
  async getDigitalHuman(id: string): Promise<ApiResponse<DigitalHuman>> {
    return httpClient.get<ApiResponse<DigitalHuman>>(`/digital-humans/${id}`);
  }

  // 获取数字人列表
  async getDigitalHumans(): Promise<ApiResponse<DigitalHuman[]>> {
    return httpClient.get<ApiResponse<DigitalHuman[]>>('/digital-humans');
  }

  // 发送消息给数字人
  async sendMessage(
    digitalHumanId: string, 
    data: SendMessageData
  ): Promise<ApiResponse<SendMessageResponse>> {
    return httpClient.post<ApiResponse<SendMessageResponse>>(
      `/digital-humans/${digitalHumanId}/chat`,
      data
    );
  }

  // 获取推荐话题
  async getRecommendedTopics(digitalHumanId: string): Promise<ApiResponse<RecommendedTopic[]>> {
    return httpClient.get<ApiResponse<RecommendedTopic[]>>(`/digital-humans/${digitalHumanId}/topics`);
  }

  // 获取聊天历史
  async getChatHistory(digitalHumanId: string): Promise<ApiResponse<ChatMessage[]>> {
    return httpClient.get<ApiResponse<ChatMessage[]>>(`/digital-humans/${digitalHumanId}/history`);
  }

  // 收藏/取消收藏数字人
  async toggleFavorite(digitalHumanId: string, isFavorited: boolean): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(`/digital-humans/${digitalHumanId}/favorite`, { isFavorited });
  }
}

export const digitalHumanService = new DigitalHumanService();