// 记忆统计数据
export interface MemoryStats {
  totalNodes: number;      // 记忆节点总数
  totalEdges: number;      // 关系连接总数
  documentCount: number;   // 文档片段数
  vectorCoverage: number;  // 向量覆盖率（百分比）
}

// 记忆类型枚举
export enum MemoryType {
  CONCEPT = 'concept',     // 概念知识
  PERSON = 'person',       // 人物关系
  EVENT = 'event',         // 事件记录
  SKILL = 'skill'          // 技能模式
}

// 记忆类型过滤项
export interface MemoryFilter {
  type: MemoryType;
  label: string;
  icon: string;
  count: number;
  active: boolean;
}

// 记忆列表项
export interface MemoryItem {
  id: string;
  content: string;
  type: MemoryType;
  timestamp: string;
  preview: string;
  active?: boolean;
}

// 知识图谱节点
export interface GraphNode {
  id: number;
  x: number;
  y: number;
  label: string;
  type: MemoryType;
  size: number;
  color?: string;
}

// 知识图谱边
export interface GraphEdge {
  from: number;
  to: number;
  label: string;
  weight?: number;
}

// 知识图谱数据
export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// 记忆关系项
export interface MemoryRelation {
  source: string;
  relation: string;
  target: string;
}

// 记忆标签
export interface MemoryTag {
  id: string;
  name: string;
  color?: string;
}

// 时间线项
export interface TimelineItem {
  time: string;
  content: string;
  type?: 'info' | 'success' | 'warning';
}

// 记忆详情
export interface MemoryDetail {
  id: string;
  title: string;
  content: string;                    // MongoDB 文档内容
  relations: MemoryRelation[];        // Neo4j 关系
  similarity: number;                  // Chroma 向量相似度
  tags: MemoryTag[];                  // 标签分类
  timeline: TimelineItem[];           // 记忆形成过程
  metadata?: Record<string, any>;
}

// API 请求参数
export interface MemoryListParams {
  digitalHumanId: string;
  type?: MemoryType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface MemorySearchParams {
  digitalHumanId: string;
  query: string;
  type?: MemoryType;
  limit?: number;
}

// 节点颜色映射
export const NODE_COLORS: Record<MemoryType, string> = {
  [MemoryType.CONCEPT]: '#00D9FF',  // 青色
  [MemoryType.PERSON]: '#00F5A0',   // 绿色
  [MemoryType.EVENT]: '#F7B731',    // 黄色
  [MemoryType.SKILL]: '#7B68EE'     // 紫色
};

// 过滤器图标映射
export const FILTER_ICONS: Record<MemoryType, string> = {
  [MemoryType.CONCEPT]: '💡',
  [MemoryType.PERSON]: '👤',
  [MemoryType.EVENT]: '📅',
  [MemoryType.SKILL]: '🎯'
};

// 过滤器标签映射
export const FILTER_LABELS: Record<MemoryType, string> = {
  [MemoryType.CONCEPT]: '概念知识',
  [MemoryType.PERSON]: '人物关系',
  [MemoryType.EVENT]: '事件记录',
  [MemoryType.SKILL]: '技能模式'
};