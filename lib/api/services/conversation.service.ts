import { httpClient } from '@/lib/api/http-client';
import { ApiResponse } from '@/lib/types/api';
import {
  ConversationCreate,
  ConversationPageRequest,
  ConversationPageResponse,
  ConversationDetailRequest,
  ConversationUpdateRequest,
  ConversationDeleteRequest,
  ConversationMessagesRequest,
  ConversationSendRequest,
  ConversationChatRequest,
  ConversationClearRequest,
  Conversation,
  ConversationWithMessages,
  Message
} from '@/lib/types/conversation';

class ConversationService {
  private readonly basePath = '/api/v1/conversations';

  async createConversation(data: ConversationCreate): Promise<ApiResponse<Conversation>> {
    return httpClient.post<ApiResponse<Conversation>>(
      `${this.basePath}/create`,
      data
    );
  }

  async getConversations(data?: ConversationPageRequest): Promise<ConversationPageResponse> {
    return httpClient.post<ConversationPageResponse>(
      `${this.basePath}/page`,
      {
        page: data?.page || 1,
        size: data?.size || 10,
        ...(data?.search && { search: data.search }),
        ...(data?.status && { status: data.status })
      }
    );
  }

  async getConversationDetail(data: ConversationDetailRequest): Promise<ApiResponse<Conversation>> {
    return httpClient.post<ApiResponse<Conversation>>(
      `${this.basePath}/detail`,
      data
    );
  }

  async updateConversation(data: ConversationUpdateRequest): Promise<ApiResponse<Conversation>> {
    return httpClient.post<ApiResponse<Conversation>>(
      `${this.basePath}/update`,
      data
    );
  }

  async deleteConversation(data: ConversationDeleteRequest): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/delete`,
      data
    );
  }

  async getConversationMessages(data: ConversationMessagesRequest): Promise<ApiResponse<ConversationWithMessages>> {
    return httpClient.post<ApiResponse<ConversationWithMessages>>(
      `${this.basePath}/messages`,
      data
    );
  }

  async sendMessage(data: ConversationSendRequest): Promise<ApiResponse<Message>> {
    return httpClient.post<ApiResponse<Message>>(
      `${this.basePath}/send`,
      data
    );
  }

  async chatStream(data: ConversationChatRequest): Promise<EventSource> {
    const token = localStorage.getItem('token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${this.basePath}/chat`;
    
    const eventSource = new EventSource(
      `${url}?${new URLSearchParams({
        conversation_id: data.conversation_id.toString(),
        message: data.message,
        stream: (data.stream ?? true).toString()
      })}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } as any
    );
    
    return eventSource;
  }

  async chatStreamPost(data: ConversationChatRequest): Promise<Response> {
    const token = localStorage.getItem('token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${this.basePath}/chat`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  }

  async clearConversationHistory(data: ConversationClearRequest): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(
      `${this.basePath}/clear`,
      data
    );
  }
}

export const conversationService = new ConversationService();