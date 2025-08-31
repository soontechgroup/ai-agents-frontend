import HttpClient from '@/lib/api/http-client';
import { ApiResponse } from '@/lib/types/api';
import {
  MemoryStats,
  MemoryItem,
  MemoryDetail,
  KnowledgeGraphData,
  MemoryListParams,
  MemorySearchParams,
  MemoryType,
  FILTER_ICONS,
  FILTER_LABELS
} from '@/lib/types/memory';

// 模拟数据
const mockStats: MemoryStats = {
  totalNodes: 1248,
  totalEdges: 3521,
  documentCount: 856,
  vectorCoverage: 92
};

const mockMemoryList: MemoryItem[] = [
  {
    id: '1',
    content: '学习了"30秒电梯法则"的表达技巧，适用于时间紧张的会议场景',
    type: MemoryType.CONCEPT,
    timestamp: '2分钟前',
    preview: '30秒电梯法则',
    active: true
  },
  {
    id: '2',
    content: 'PREP结构：Point-Reason-Example-Point，用于有条理地表达观点',
    type: MemoryType.CONCEPT,
    timestamp: '15分钟前',
    preview: 'PREP结构'
  },
  {
    id: '3',
    content: '用户反馈：需要更简洁的表达方式，会议时间通常很紧张',
    type: MemoryType.EVENT,
    timestamp: '1小时前',
    preview: '用户反馈'
  },
  {
    id: '4',
    content: '演讲紧张的克服方法：深呼吸、提前准备、积极心理暗示',
    type: MemoryType.SKILL,
    timestamp: '3小时前',
    preview: '克服紧张'
  },
  {
    id: '5',
    content: '职场沟通的核心：清晰、简洁、有重点，避免冗长表达',
    type: MemoryType.CONCEPT,
    timestamp: '1天前',
    preview: '职场沟通'
  }
];

const mockGraphData: KnowledgeGraphData = {
  nodes: [
    { id: 1, x: 400, y: 300, label: '30秒电梯法则', type: MemoryType.CONCEPT, size: 40 },
    { id: 2, x: 250, y: 200, label: 'PREP结构', type: MemoryType.CONCEPT, size: 35 },
    { id: 3, x: 550, y: 250, label: '快节奏会议', type: MemoryType.EVENT, size: 30 },
    { id: 4, x: 350, y: 450, label: '用户反馈', type: MemoryType.PERSON, size: 25 },
    { id: 5, x: 500, y: 400, label: '简洁表达', type: MemoryType.SKILL, size: 30 },
    { id: 6, x: 300, y: 350, label: '三步结构', type: MemoryType.CONCEPT, size: 25 },
    { id: 7, x: 600, y: 350, label: '时间管理', type: MemoryType.SKILL, size: 25 }
  ],
  edges: [
    { from: 1, to: 2, label: '相关' },
    { from: 1, to: 3, label: '适用于' },
    { from: 4, to: 1, label: '促成' },
    { from: 1, to: 5, label: '实现' },
    { from: 1, to: 6, label: '包含' },
    { from: 1, to: 7, label: '涉及' },
    { from: 2, to: 5, label: '支持' }
  ]
};

const mockMemoryDetail: MemoryDetail = {
  id: '1',
  title: '30秒电梯法则',
  content: `这是一种快速、高效的表达方法，特别适合时间紧张的场合：
1. 一句话说明核心观点（5秒）
2. 列出三个关键理由（20秒）
3. 提出明确的行动建议（5秒）

示例："建议优先开发移动端。理由：一是移动用户占70%，二是竞品都在发力移动，三是开发成本更低。建议下周启动移动端项目。"`,
  relations: [
    { source: '30秒电梯法则', relation: '适用于', target: '快节奏会议' },
    { source: '30秒电梯法则', relation: '包含', target: '三步结构' },
    { source: '30秒电梯法则', relation: '相关', target: 'PREP结构' },
    { source: '用户反馈', relation: '促成', target: '30秒电梯法则' }
  ],
  similarity: 0.85,
  tags: [
    { id: '1', name: '表达技巧' },
    { id: '2', name: '会议沟通' },
    { id: '3', name: '时间管理' },
    { id: '4', name: '职场技能' },
    { id: '5', name: '简洁表达' }
  ],
  timeline: [
    { time: '10:30', content: '用户询问会议表达技巧' },
    { time: '10:32', content: '提供PREP结构方法' },
    { time: '10:35', content: '用户反馈需要更简洁' },
    { time: '10:36', content: '形成30秒电梯法则' }
  ]
};

export class MemoryService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  /**
   * 获取记忆统计数据
   */
  async getMemoryStats(digitalHumanId: string): Promise<ApiResponse<MemoryStats>> {
    // TODO: 对接真实接口
    // return this.httpClient.post<MemoryStats>(`/digital-humans/${digitalHumanId}/memory/stats`);
    
    // 返回模拟数据
    return Promise.resolve({
      code: 0,
      data: mockStats,
      message: 'success'
    });
  }

  /**
   * 获取记忆列表
   */
  async getMemoryList(params: MemoryListParams): Promise<ApiResponse<MemoryItem[]>> {
    // TODO: 对接真实接口
    // return this.httpClient.post<MemoryItem[]>(`/digital-humans/${params.digitalHumanId}/memory/list`, params);
    
    // 返回模拟数据，可根据参数过滤
    let filteredList = [...mockMemoryList];
    
    if (params.type) {
      filteredList = filteredList.filter(item => item.type === params.type);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredList = filteredList.filter(item => 
        item.content.toLowerCase().includes(searchLower) ||
        item.preview.toLowerCase().includes(searchLower)
      );
    }
    
    return Promise.resolve({
      code: 0,
      data: filteredList,
      message: 'success'
    });
  }

  /**
   * 搜索记忆
   */
  async searchMemory(params: MemorySearchParams): Promise<ApiResponse<MemoryItem[]>> {
    // TODO: 对接真实接口
    // return this.httpClient.post<MemoryItem[]>(`/digital-humans/${params.digitalHumanId}/memory/search`, params);
    
    // 使用 getMemoryList 的逻辑
    return this.getMemoryList({
      digitalHumanId: params.digitalHumanId,
      search: params.query,
      type: params.type
    });
  }

  /**
   * 获取记忆详情
   */
  async getMemoryDetail(digitalHumanId: string, memoryId: string): Promise<ApiResponse<MemoryDetail>> {
    // TODO: 对接真实接口
    // return this.httpClient.post<MemoryDetail>(`/digital-humans/${digitalHumanId}/memory/${memoryId}`);
    
    // 返回模拟数据
    return Promise.resolve({
      code: 0,
      data: { ...mockMemoryDetail, id: memoryId },
      message: 'success'
    });
  }

  /**
   * 获取知识图谱数据
   */
  async getKnowledgeGraph(digitalHumanId: string): Promise<ApiResponse<KnowledgeGraphData>> {
    // TODO: 对接真实接口
    // return this.httpClient.post<KnowledgeGraphData>(`/digital-humans/${digitalHumanId}/knowledge-graph`);
    
    // 返回模拟数据
    return Promise.resolve({
      code: 0,
      data: mockGraphData,
      message: 'success'
    });
  }

  /**
   * 获取记忆类型统计
   */
  async getMemoryTypeStats(digitalHumanId: string): Promise<ApiResponse<Record<MemoryType, number>>> {
    // TODO: 对接真实接口
    
    // 返回模拟数据
    return Promise.resolve({
      code: 0,
      data: {
        [MemoryType.CONCEPT]: 423,
        [MemoryType.PERSON]: 156,
        [MemoryType.EVENT]: 289,
        [MemoryType.SKILL]: 380
      },
      message: 'success'
    });
  }
}

// 导出单例
export const memoryService = new MemoryService();