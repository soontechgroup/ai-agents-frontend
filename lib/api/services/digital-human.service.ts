import { httpClient } from '@/lib/api/http-client';
import { ApiResponse } from '@/lib/types/api';
import { 
  DigitalHuman, 
  DigitalHumanCreate, 
  DigitalHumanUpdate,
  ChatMessage, 
  RecommendedTopic 
} from '@/lib/types/digital-human';

export interface SendMessageData {
  message: string;
  isVoice?: boolean;
}

export interface SendMessageResponse {
  reply: string;
  messageId: string;
}

class DigitalHumanService {
  // 创建数字人 - 对应 POST /api/v1/digital-humans/create
  async createDigitalHuman(data: DigitalHumanCreate): Promise<ApiResponse<DigitalHuman>> {
    return httpClient.post<ApiResponse<DigitalHuman>>('/api/v1/digital-humans/create', data);
  }

  // 获取数字人详情 - 对应 GET /api/v1/digital-humans/{id}
  async getDigitalHuman(id: number): Promise<ApiResponse<DigitalHuman>> {
    return httpClient.get<ApiResponse<DigitalHuman>>(`/api/v1/digital-humans/${id}`);
  }

  // 更新数字人 - 对应 PUT /api/v1/digital-humans/{id}
  async updateDigitalHuman(id: number, data: DigitalHumanUpdate): Promise<ApiResponse<DigitalHuman>> {
    return httpClient.put<ApiResponse<DigitalHuman>>(`/api/v1/digital-humans/${id}`, data);
  }

  // 删除数字人 - 对应 DELETE /api/v1/digital-humans/{id}
  async deleteDigitalHuman(id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>(`/api/v1/digital-humans/${id}`);
  }

  // 获取数字人列表 - 对应 GET /api/v1/digital-humans/page
  async getDigitalHumans(): Promise<ApiResponse<DigitalHuman[]>> {
    return httpClient.get<ApiResponse<DigitalHuman[]>>('/api/v1/digital-humans/page');
  }

  // 发送消息给数字人
  async sendMessage(
    digitalHumanId: number, 
    data: SendMessageData
  ): Promise<ApiResponse<SendMessageResponse>> {
    return httpClient.post<ApiResponse<SendMessageResponse>>(
      `/api/v1/digital-humans/${digitalHumanId}/chat`,
      data
    );
  }

  // 获取推荐话题
  async getRecommendedTopics(digitalHumanId: number): Promise<ApiResponse<RecommendedTopic[]>> {
    return httpClient.get<ApiResponse<RecommendedTopic[]>>(`/api/v1/digital-humans/${digitalHumanId}/topics`);
  }

  // 获取聊天历史
  async getChatHistory(digitalHumanId: number): Promise<ApiResponse<ChatMessage[]>> {
    return httpClient.get<ApiResponse<ChatMessage[]>>(`/api/v1/digital-humans/${digitalHumanId}/history`);
  }

  // 收藏/取消收藏数字人
  async toggleFavorite(digitalHumanId: number, isFavorited: boolean): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(`/api/v1/digital-humans/${digitalHumanId}/favorite`, { isFavorited });
  }
}

export const digitalHumanService = new DigitalHumanService();