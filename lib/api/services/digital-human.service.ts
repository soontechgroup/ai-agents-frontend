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
  async getDigitalHuman(id: number): Promise<DigitalHuman> {
    const response = await httpClient.post<any>('/api/v1/digital-humans/detail', { id });
    // 兼容不同的响应格式
    if (response.data) {
      return response.data;
    } else if (response.id) {
      return response;
    } else {
      throw new Error(response.message || '获取数字人详情失败');
    }
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

  // 训练数字人 - 对应 POST /api/v1/digital-humans/train (SSE 流式响应)
  async trainDigitalHuman(
    digitalHumanId: number, 
    message: string,
    onMessage: (event: any) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<EventSource> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/digital-humans/train`;
    const token = localStorage.getItem('token');
    
    // 创建 EventSource 实例用于接收 SSE 流
    const eventSource = new EventSource(url, {
      // EventSource 不支持直接设置 headers，需要通过其他方式传递 token
      // 这里我们使用 POST 请求的替代方案
    } as any);
    
    // 由于浏览器的 EventSource 不支持 POST 请求，我们需要使用 fetch API
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        digital_human_id: digitalHumanId,
        message: message
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`训练请求失败: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const readStream = async () => {
        if (!reader) return;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              onComplete?.();
              break;
            }
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                try {
                  const event = JSON.parse(data);
                  onMessage(event);
                } catch (e) {
                  // 解析失败，忽略该消息
                }
              }
            }
          }
        } catch (error) {
          onError?.(error as Error);
        }
      };
      
      readStream();
    }).catch(error => {
      onError?.(error);
    });
    
    return eventSource;
  }

}

export const digitalHumanService = new DigitalHumanService();