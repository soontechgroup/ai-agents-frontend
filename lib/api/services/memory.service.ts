import HttpClient from '@/lib/api/http-client';
import { ApiResponse } from '@/lib/types/api';
import {
  MemoryGraphResponse,
  MemoryStats,
  MemoryItem,
  MemoryDetail
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
      const response = await this.httpClient.post<MemoryGraphResponse>('/digital-humans/memory-graph', {
        digital_human_id: parseInt(digitalHumanId),
        limit
      });
      
      return response;
    } catch (error) {
      console.error('Failed to get memory graph:', error);
      throw error;
    }
  }

  /**
   * 搜索记忆
   */
  async searchMemory(digitalHumanId: string, query: string): Promise<ApiResponse<MemoryItem[]>> {
    try {
      // 暂时使用记忆图谱数据进行搜索
      const graphResponse = await this.getMemoryGraph(digitalHumanId);
      
      if (graphResponse.code === 0 && graphResponse.data) {
        const memories: MemoryItem[] = graphResponse.data.nodes
          .filter(node => 
            node.label.toLowerCase().includes(query.toLowerCase()) ||
            (node.properties?.description && 
             node.properties.description.toLowerCase().includes(query.toLowerCase()))
          )
          .map(node => ({
            id: node.id,
            content: node.properties?.description || node.label,
            timestamp: node.updated_at || new Date().toISOString(),
            preview: node.label
          }));
        
        return { ...graphResponse, data: memories };
      }
      
      return { ...graphResponse, data: [] };
    } catch (error) {
      console.error('Failed to search memory:', error);
      throw error;
    }
  }

  /**
   * 获取记忆详情
   */
  async getMemoryDetail(digitalHumanId: string, nodeId: string): Promise<ApiResponse<MemoryDetail>> {
    try {
      // 获取图谱数据并找到对应节点
      const graphResponse = await this.getMemoryGraph(digitalHumanId);
      
      if (graphResponse.code === 0 && graphResponse.data) {
        const node = graphResponse.data.nodes.find(n => n.id === nodeId);
        
        if (node) {
          // 找到相关的边
          const relatedEdges = graphResponse.data.edges.filter(
            edge => edge.source === nodeId || edge.target === nodeId
          );
          
          const detail: MemoryDetail = {
            id: node.id,
            title: node.label,
            content: node.properties?.description || node.label,
            relations: relatedEdges.map(edge => ({
              source: edge.source,
              relation: edge.type,
              target: edge.target
            })),
            similarity: node.confidence,
            tags: Object.entries(node.properties || {})
              .filter(([key]) => key !== 'description')
              .map(([key, value], i) => ({
                id: String(i),
                name: `${key}: ${value}`
              })),
            timeline: []
          };
          
          return { code: 0, data: detail, message: 'success' };
        }
      }
      
      throw new Error('Memory node not found');
    } catch (error) {
      console.error('Failed to get memory detail:', error);
      throw error;
    }
  }

  /**
   * 获取记忆统计（从图谱数据中提取）
   */
  async getMemoryStats(digitalHumanId: string): Promise<ApiResponse<MemoryStats>> {
    try {
      const graphResponse = await this.getMemoryGraph(digitalHumanId);
      
      if (graphResponse.code === 0 && graphResponse.data) {
        const stats: MemoryStats = {
          totalNodes: graphResponse.data.statistics.total_nodes,
          totalEdges: graphResponse.data.statistics.total_edges,
          documentCount: graphResponse.data.statistics.displayed_nodes,
          vectorCoverage: Math.min(
            (graphResponse.data.statistics.displayed_nodes / 
             Math.max(graphResponse.data.statistics.total_nodes, 1)) * 100,
            100
          )
        };
        
        return { code: 0, data: stats, message: 'success' };
      }
      
      // 返回默认值
      return {
        code: 0,
        data: {
          totalNodes: 0,
          totalEdges: 0,
          documentCount: 0,
          vectorCoverage: 0
        },
        message: 'success'
      };
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      throw error;
    }
  }
}

// 导出单例
export const memoryService = new MemoryService();