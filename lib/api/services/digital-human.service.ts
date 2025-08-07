import { httpClient } from '@/lib/api/http-client';
import { ApiResponse } from '@/lib/types/api';
import { 
  DigitalHuman, 
  DigitalHumanCreate, 
  DigitalHumanUpdate,
  ChatMessage, 
  RecommendedTopic,
  DigitalHumanPageRequest,
  DigitalHumanPageResponse
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

  // 获取数字人详情 - 对应 POST /api/v1/digital-humans/detail
  async getDigitalHuman(id: number): Promise<ApiResponse<DigitalHuman>> {
    return httpClient.post<ApiResponse<DigitalHuman>>('/api/v1/digital-humans/detail', { id });
  }

  // 更新数字人 - 对应 POST /api/v1/digital-humans/update
  async updateDigitalHuman(id: number, data: DigitalHumanUpdate): Promise<ApiResponse<DigitalHuman>> {
    return httpClient.post<ApiResponse<DigitalHuman>>('/api/v1/digital-humans/update', { id, ...data });
  }

  // 删除数字人 - 对应 POST /api/v1/digital-humans/delete
  async deleteDigitalHuman(id: number): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>('/api/v1/digital-humans/delete', { id });
  }

  // 获取数字人列表 - 对应 POST /api/v1/digital-humans/page
  async getDigitalHumans(params?: DigitalHumanPageRequest): Promise<DigitalHumanPageResponse> {
    const requestBody = {
      page: params?.page || 1,
      size: params?.size || 10,
      ...(params?.search && { search: params.search }),
      include_public: params?.include_public ?? true
    };
    
    return httpClient.post<DigitalHumanPageResponse>('/api/v1/digital-humans/page', requestBody);
  }

}

export const digitalHumanService = new DigitalHumanService();