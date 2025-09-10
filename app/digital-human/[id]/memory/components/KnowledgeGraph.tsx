'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ForceGraphWrapper as ForceGraph } from '@/components/digital-human/memory/ForceGraphWrapper';
import { 
  KnowledgeGraphData, 
  ForceGraphData,
  ForceGraphNode
} from '@/lib/types/memory';
import { 
  convertToForceGraphData, 
  getNeighborNodes,
  getNodeLinks,
  filterGraphData
} from '@/lib/utils/graph-utils';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
  scale?: number;
  offset?: { x: number; y: number };
  onNodeClick: (nodeId: string | number) => void;
}

export function KnowledgeGraph({ data, onNodeClick }: KnowledgeGraphProps) {
  const [forceGraphData, setForceGraphData] = useState<ForceGraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<string | number | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string | number>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: ForceGraphNode } | null>(null);
  // 转换数据格式
  useEffect(() => {
    if (data) {
      const convertedData = convertToForceGraphData(data);
      setForceGraphData(convertedData);
    }
  }, [data]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: ForceGraphNode) => {
    setSelectedNode(node.id);
    
    // 高亮相邻节点和边
    const neighbors = getNeighborNodes(node.id, forceGraphData);
    const links = getNodeLinks(node.id, forceGraphData);
    
    setHighlightNodes(new Set([node.id, ...neighbors]));
    setHighlightLinks(links);
    
    // 调用父组件的回调
    onNodeClick(node.id);
  }, [forceGraphData, onNodeClick]);

  // 处理节点右键菜单
  const handleNodeRightClick = useCallback((node: ForceGraphNode, event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  }, []);

  // 处理节点悬停
  const handleNodeHover = useCallback((node: ForceGraphNode | null) => {
    if (node && !selectedNode) {
      // 悬停时临时高亮
      const neighbors = getNeighborNodes(node.id, forceGraphData);
      const links = getNodeLinks(node.id, forceGraphData);
      setHighlightNodes(new Set([node.id, ...neighbors]));
      setHighlightLinks(links);
    } else if (!node && !selectedNode) {
      // 移开时清除高亮（如果没有选中节点）
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [forceGraphData, selectedNode]);

  // 关闭右键菜单
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 清除选中状态
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  // 右键菜单操作
  const handleContextMenuAction = useCallback((action: string) => {
    if (!contextMenu) return;
    
    const node = contextMenu.node;
    
    switch (action) {
      case 'expand':
        // 展开节点逻辑
        break;
      case 'hide':
        // 隐藏节点逻辑
        break;
      case 'details':
        // 查看详情
        onNodeClick(node.id);
        break;
      case 'pin':
        // 固定/取消固定节点
        const nodeData = forceGraphData.nodes.find(n => n.id === node.id);
        if (nodeData) {
          if (nodeData.fx !== undefined) {
            nodeData.fx = undefined;
            nodeData.fy = undefined;
          } else {
            nodeData.fx = nodeData.x;
            nodeData.fy = nodeData.y;
          }
          setForceGraphData({ ...forceGraphData });
        }
        break;
    }
    
    setContextMenu(null);
  }, [contextMenu, forceGraphData, onNodeClick]);

  return (
    <div className="relative w-full h-full">
      {/* 主图 */}
      <ForceGraph
        data={forceGraphData}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        onNodeHover={handleNodeHover}
        selectedNodeId={selectedNode}
        highlightNodes={highlightNodes}
        highlightLinks={highlightLinks}
      />

      {/* 选中节点信息栏 */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg p-4 max-w-xs">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-white">节点信息</h3>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {(() => {
            const node = forceGraphData.nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            return (
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">标签</span>
                  <p className="text-sm text-white">{node.label}</p>
                </div>
                {node.type && (
                  <div>
                    <span className="text-xs text-gray-500">类型</span>
                    <p className="text-sm text-white">{node.type}</p>
                  </div>
                )}
                {node.description && (
                  <div>
                    <span className="text-xs text-gray-500">描述</span>
                    <p className="text-sm text-gray-300">{node.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">连接数</span>
                  <p className="text-sm text-white">{highlightNodes.size - 1}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          className="absolute bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleContextMenuAction('expand')}
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            展开关联节点
          </button>
          <button
            onClick={() => handleContextMenuAction('hide')}
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            隐藏节点
          </button>
          <button
            onClick={() => handleContextMenuAction('pin')}
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            {contextMenu.node.fx !== null ? '取消固定' : '固定位置'}
          </button>
          <hr className="my-1 border-gray-700" />
          <button
            onClick={() => handleContextMenuAction('details')}
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            查看详情
          </button>
        </div>
      )}
    </div>
  );
}