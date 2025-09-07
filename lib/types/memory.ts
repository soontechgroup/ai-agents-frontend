// 记忆统计数据
export interface MemoryStats {
  totalNodes: number;      // 记忆节点总数
  totalEdges: number;      // 关系连接总数
  documentCount: number;   // 文档片段数
  vectorCoverage: number;  // 向量覆盖率（百分比）
}

// 记忆图谱节点（与后端保持一致）
export interface MemoryGraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  confidence: number;
  properties: Record<string, any>;
  updated_at?: string;
}

// 记忆图谱边（与后端保持一致）
export interface MemoryGraphEdge {
  source: string;
  target: string;
  type: string;
  confidence: number;
  properties?: Record<string, any>;
}

// 记忆图谱统计信息
export interface MemoryGraphStatistics {
  total_nodes: number;
  total_edges: number;
  displayed_nodes: number;
  displayed_edges: number;
  categories: Record<string, number>;
}

// 记忆图谱响应
export interface MemoryGraphResponse {
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
  statistics: MemoryGraphStatistics;
}

// 记忆列表项
export interface MemoryItem {
  id: string;
  content: string;
  timestamp: string;
  preview: string;
  active?: boolean;
}

// 知识图谱节点（用于可视化）
export interface GraphNode {
  id: string | number;
  x: number;
  y: number;
  label: string;
  type?: string;
  size: number;
  color?: string;
  description?: string;
  confidence?: number;
}

// 知识图谱边（用于可视化）
export interface GraphEdge {
  from: string | number;
  to: string | number;
  label: string;
  weight?: number;
}

// 知识图谱数据（用于可视化）
export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Force Graph 节点类型
export interface ForceGraphNode {
  id: string | number;
  label: string;
  type?: string;
  size?: number;
  color?: string;
  description?: string;
  group?: number;
  value?: number;
  x?: number;
  y?: number;
  fx?: number | null;  // 固定x坐标
  fy?: number | null;  // 固定y坐标
  vx?: number;  // 速度x
  vy?: number;  // 速度y
}

// Force Graph 边类型
export interface ForceGraphLink {
  source: string | number | ForceGraphNode;
  target: string | number | ForceGraphNode;
  label?: string;
  value?: number;
  distance?: number;  // 边的理想长度
  strength?: number;  // 边的强度
  color?: string;
}

// Force Graph 数据结构
export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
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
export interface MemoryGraphRequest {
  digitalHumanId: string;
  limit?: number;
  nodeTypes?: string[];
}

// 根据置信度获取节点颜色
export function getNodeColor(confidence: number): string {
  // 根据置信度返回不同的颜色
  if (confidence >= 0.8) return '#00F5A0';  // 绿色 - 高置信度
  if (confidence >= 0.6) return '#00D9FF';  // 青色 - 中高置信度
  if (confidence >= 0.4) return '#F7B731';  // 黄色 - 中置信度
  if (confidence >= 0.2) return '#FF6B6B';  // 红色 - 低置信度
  return '#6B7280';  // 灰色 - 极低置信度
}

// 节点类型的默认颜色（如果需要按类型着色）
export const NODE_TYPE_COLORS: Record<string, string> = {
  'entity': '#00D9FF',
  'concept': '#F7B731',
  'event': '#FF6B6B',
  'relation': '#7B68EE',
  'default': '#6B7280'
};