import HttpClient from '@/lib/api/http-client';
import { ApiResponse } from '@/lib/types/api';
import {
  MemoryGraphResponse,
  MemoryGraphNode,
  MemoryStats,
  MemoryStatsResponse,
  MemoryItem,
  MemoryDetail,
  MemoryDetailResponse,
  TrainingMessagesPageResponse
} from '@/lib/types/memory';

export class MemoryService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  /**
   * 获取数字人记忆图谱
   */
  async getMemoryGraph(digitalHumanId: string, limit: number = 100): Promise<ApiResponse<MemoryGraphResponse>> {
    try {
      const response = await this.httpClient.post<ApiResponse<MemoryGraphResponse>>('/api/v1/digital-humans/memory-graph', {
        digital_human_id: parseInt(digitalHumanId),
        limit
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 搜索记忆
   */
  async searchMemory(
    digitalHumanId: string,
    query: string,
    nodeTypes?: string[],
    limit: number = 50
  ): Promise<ApiResponse<MemoryGraphNode[]>> {
    try {
      const response = await this.httpClient.post<ApiResponse<MemoryGraphNode[]>>(
        '/api/v1/digital-humans/memory-search',
        {
          digital_human_id: parseInt(digitalHumanId),
          query,
          node_types: nodeTypes,
          limit
        }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取记忆详情
   */
  async getMemoryDetail(
    digitalHumanId: string,
    nodeId: string,
    includeRelations: boolean = true,
    relationDepth: number = 1
  ): Promise<ApiResponse<MemoryDetailResponse>> {
    try {
      const response = await this.httpClient.post<ApiResponse<MemoryDetailResponse>>(
        '/api/v1/digital-humans/memory-detail',
        {
          digital_human_id: parseInt(digitalHumanId),
          node_id: nodeId,
          include_relations: includeRelations,
          relation_depth: relationDepth
        }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取记忆统计
   */
  async getMemoryStats(
    digitalHumanId: string,
    includeTimeline: boolean = false
  ): Promise<ApiResponse<MemoryStatsResponse>> {
    try {
      const response = await this.httpClient.post<ApiResponse<MemoryStatsResponse>>(
        '/api/v1/digital-humans/memory-stats',
        {
          digital_human_id: parseInt(digitalHumanId),
          include_timeline: includeTimeline
        }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取训练消息历史
   */
  async getTrainingMessages(
    digitalHumanId: string,
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<TrainingMessagesPageResponse>> {
    try {
      const response = await this.httpClient.post<ApiResponse<TrainingMessagesPageResponse>>(
        '/api/v1/digital-humans/training-messages',
        {
          digital_human_id: parseInt(digitalHumanId),
          page,
          size
        }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// 导出单例
export const memoryService = new MemoryService();