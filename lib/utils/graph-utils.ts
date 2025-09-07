import {
  GraphNode,
  GraphEdge,
  KnowledgeGraphData,
  ForceGraphData,
  ForceGraphNode,
  ForceGraphLink,
  MemoryType,
  NODE_COLORS
} from '@/lib/types/memory';

/**
 * 转换普通图数据为力导向图数据
 */
export function convertToForceGraphData(data: KnowledgeGraphData): ForceGraphData {
  // 转换节点
  const nodes: ForceGraphNode[] = data.nodes.map(node => ({
    id: node.id,
    label: node.label,
    type: node.type,
    size: node.size || 5,
    color: node.color || NODE_COLORS[node.type],
    x: node.x,
    y: node.y,
    value: node.size  // 用于力导向图的节点权重
  }));

  // 转换边
  const links: ForceGraphLink[] = data.edges.map(edge => ({
    source: edge.from,
    target: edge.to,
    label: edge.label,
    value: edge.weight || 1,
    distance: 100,  // 默认边长度
    strength: edge.weight ? edge.weight / 10 : 0.5  // 边的强度基于权重
  }));

  return { nodes, links };
}

/**
 * 查找节点的相邻节点
 */
export function getNeighborNodes(
  nodeId: string | number,
  data: ForceGraphData
): Set<string | number> {
  const neighbors = new Set<string | number>();
  
  data.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (sourceId === nodeId) {
      neighbors.add(targetId);
    } else if (targetId === nodeId) {
      neighbors.add(sourceId);
    }
  });
  
  return neighbors;
}

/**
 * 获取节点间的所有连接
 */
export function getNodeLinks(
  nodeId: string | number,
  data: ForceGraphData
): Set<string> {
  const links = new Set<string>();
  
  data.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (sourceId === nodeId || targetId === nodeId) {
      links.add(`${sourceId}-${targetId}`);
    }
  });
  
  return links;
}

/**
 * 过滤图数据
 */
export function filterGraphData(
  data: ForceGraphData,
  filter: {
    types?: MemoryType[];
    searchQuery?: string;
    minNodeSize?: number;
  }
): ForceGraphData {
  let filteredNodes = [...data.nodes];
  
  // 按类型过滤
  if (filter.types && filter.types.length > 0) {
    filteredNodes = filteredNodes.filter(node => 
      node.type && filter.types!.includes(node.type)
    );
  }
  
  // 按搜索词过滤
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filteredNodes = filteredNodes.filter(node =>
      node.label.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query)
    );
  }
  
  // 按节点大小过滤
  if (filter.minNodeSize) {
    filteredNodes = filteredNodes.filter(node =>
      (node.size || 0) >= filter.minNodeSize!
    );
  }
  
  // 获取过滤后节点的ID集合
  const nodeIds = new Set(filteredNodes.map(n => n.id));
  
  // 只保留连接过滤后节点的边
  const filteredLinks = data.links.filter(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });
  
  return {
    nodes: filteredNodes,
    links: filteredLinks
  };
}

/**
 * 计算图的中心节点（基于连接数）
 */
export function getCentralNodes(
  data: ForceGraphData,
  topN: number = 5
): ForceGraphNode[] {
  const nodeDegrees = new Map<string | number, number>();
  
  // 计算每个节点的度（连接数）
  data.nodes.forEach(node => {
    nodeDegrees.set(node.id, 0);
  });
  
  data.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    nodeDegrees.set(sourceId, (nodeDegrees.get(sourceId) || 0) + 1);
    nodeDegrees.set(targetId, (nodeDegrees.get(targetId) || 0) + 1);
  });
  
  // 排序并返回前N个节点
  return data.nodes
    .sort((a, b) => (nodeDegrees.get(b.id) || 0) - (nodeDegrees.get(a.id) || 0))
    .slice(0, topN);
}

/**
 * 生成节点分组（用于聚类）
 */
export function generateNodeGroups(data: ForceGraphData): Map<number, ForceGraphNode[]> {
  const groups = new Map<number, ForceGraphNode[]>();
  
  data.nodes.forEach(node => {
    const group = node.group || 0;
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(node);
  });
  
  return groups;
}

/**
 * 计算图的布局边界
 */
export function getGraphBounds(data: ForceGraphData) {
  if (data.nodes.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  data.nodes.forEach(node => {
    if (node.x !== undefined) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
    }
    if (node.y !== undefined) {
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
  });
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * 生成模拟的力导向图数据
 */
export function generateMockForceGraphData(nodeCount: number = 30): ForceGraphData {
  const types = Object.values(MemoryType);
  const nodes: ForceGraphNode[] = [];
  const links: ForceGraphLink[] = [];
  
  // 生成节点
  for (let i = 0; i < nodeCount; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    nodes.push({
      id: i,
      label: `节点 ${i}`,
      type,
      size: Math.random() * 10 + 5,
      color: NODE_COLORS[type],
      description: `这是节点 ${i} 的描述信息`,
      group: Math.floor(Math.random() * 4),
      value: Math.random() * 100
    });
  }
  
  // 生成边（确保图是连通的）
  for (let i = 1; i < nodeCount; i++) {
    // 每个节点至少连接到一个已存在的节点
    const target = Math.floor(Math.random() * i);
    links.push({
      source: i,
      target,
      label: `关系 ${i}-${target}`,
      value: Math.random() * 5 + 1,
      distance: 80 + Math.random() * 40,
      strength: Math.random() * 0.5 + 0.5
    });
  }
  
  // 添加一些额外的边增加复杂度
  for (let i = 0; i < nodeCount / 2; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    const target = Math.floor(Math.random() * nodeCount);
    if (source !== target) {
      links.push({
        source,
        target,
        label: `额外关系 ${source}-${target}`,
        value: Math.random() * 3 + 1,
        distance: 100 + Math.random() * 50,
        strength: Math.random() * 0.3 + 0.3
      });
    }
  }
  
  return { nodes, links };
}