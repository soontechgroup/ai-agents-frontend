'use client';

import { forwardRef, useImperativeHandle, useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3-force';
import { ForceGraphData, ForceGraphNode, ForceGraphLink } from '@/lib/types/memory';

interface ForceGraphProps {
  data: ForceGraphData;
  onNodeClick?: (node: ForceGraphNode) => void;
  onNodeRightClick?: (node: ForceGraphNode, event: MouseEvent) => void;
  onNodeHover?: (node: ForceGraphNode | null) => void;
  selectedNodeId?: string | number | null;
  highlightNodes?: Set<string | number>;
  highlightLinks?: Set<string>;
  width?: number;
  height?: number;
}

export const ForceGraph = forwardRef<any, ForceGraphProps>(({
  data,
  onNodeClick,
  onNodeRightClick,
  onNodeHover,
  selectedNodeId,
  highlightNodes = new Set(),
  highlightLinks = new Set(),
  width,
  height
}, ref) => {
  const fgRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<ForceGraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 暴露 ref 方法
  useImperativeHandle(ref, () => fgRef.current, []);

  // 更新尺寸
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: width || container.clientWidth,
          height: height || container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // 配置力导向图
  useEffect(() => {
    if (fgRef.current) {
      // 配置力学参数
      fgRef.current.d3Force('link')
        ?.distance((link: ForceGraphLink) => link.distance || 100)
        .strength((link: ForceGraphLink) => link.strength || 1);
      
      fgRef.current.d3Force('charge')
        ?.strength(-300)
        .distanceMax(250);
      
      fgRef.current.d3Force('center')
        ?.strength(0.05);
      
      // 添加碰撞检测
      fgRef.current.d3Force('collide', d3.forceCollide(30));
    }
  }, [data]);

  // 节点绘制
  const nodeCanvasObject = useCallback((node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || node.id.toString();
    const fontSize = 12 / globalScale;
    const nodeSize = node.size || 5;
    
    // 选中或高亮状态
    const isSelected = selectedNodeId === node.id;
    const isHighlighted = highlightNodes.has(node.id);
    const isHovered = hoveredNode?.id === node.id;
    
    // 绘制节点光晕
    if (isSelected || isHighlighted || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, nodeSize * 2.5, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(
        node.x!, node.y!, 0,
        node.x!, node.y!, nodeSize * 2.5
      );
      gradient.addColorStop(0, `${node.color}40`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // 绘制节点主体
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || '#00D9FF';
    ctx.fill();
    
    // 绘制边框
    if (isSelected || isHovered) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }
    
    // 绘制标签
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isSelected || isHovered ? '#FFFFFF' : '#F5F5F5';
    ctx.fillText(label, node.x!, node.y! + nodeSize + fontSize);
  }, [selectedNodeId, highlightNodes, hoveredNode]);

  // 边绘制
  const linkCanvasObject = useCallback((link: ForceGraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightLinks.has(`${link.source}-${link.target}`);
    
    // 设置边样式
    ctx.strokeStyle = isHighlighted ? '#00D9FF' : 'rgba(0, 217, 255, 0.3)';
    ctx.lineWidth = (isHighlighted ? 2 : 1) / globalScale;
    
    // 绘制边
    ctx.beginPath();
    const sourceNode = link.source as ForceGraphNode;
    const targetNode = link.target as ForceGraphNode;
    ctx.moveTo(sourceNode.x!, sourceNode.y!);
    ctx.lineTo(targetNode.x!, targetNode.y!);
    ctx.stroke();
    
    // 绘制边标签
    if (link.label) {
      const midX = (sourceNode.x! + targetNode.x!) / 2;
      const midY = (sourceNode.y! + targetNode.y!) / 2;
      
      ctx.font = `${10 / globalScale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#6C7293';
      ctx.fillText(link.label, midX, midY);
    }
  }, [highlightLinks]);

  // 处理节点点击
  const handleNodeClick = useCallback((node: ForceGraphNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  // 处理节点右键
  const handleNodeRightClick = useCallback((node: ForceGraphNode, event: MouseEvent) => {
    event.preventDefault();
    if (onNodeRightClick) {
      onNodeRightClick(node, event);
    }
  }, [onNodeRightClick]);

  // 处理节点悬停
  const handleNodeHover = useCallback((node: ForceGraphNode | null) => {
    setHoveredNode(node);
    if (onNodeHover) {
      onNodeHover(node);
    }
    
    // 设置鼠标样式
    const canvas = document.querySelector('#graph-container canvas');
    if (canvas) {
      (canvas as HTMLCanvasElement).style.cursor = node ? 'pointer' : 'default';
    }
  }, [onNodeHover]);

  // 处理节点拖拽结束
  const handleNodeDragEnd = useCallback((node: ForceGraphNode) => {
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  // 追踪鼠标位置
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setMousePos({ x: event.clientX, y: event.clientY });
  }, []);

  // 自动调整视图
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      // 延迟一下让图先渲染
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [data]);

  // 计算悬停提示框位置
  const getTooltipPosition = useCallback(() => {
    if (!hoveredNode || !fgRef.current) {
      return { left: 0, top: 0 };
    }

    // 尝试将图空间坐标转换为屏幕坐标
    const screenCoords = fgRef.current.graph2ScreenCoords 
      ? fgRef.current.graph2ScreenCoords(hoveredNode.x, hoveredNode.y)
      : { x: mousePos.x, y: mousePos.y };

    // 获取容器位置
    const container = document.getElementById('graph-container');
    if (!container) return { left: 0, top: 0 };
    
    const rect = container.getBoundingClientRect();
    
    return {
      left: screenCoords.x - rect.left,
      top: screenCoords.y - rect.top - 40  // 向上偏移40px
    };
  }, [hoveredNode, mousePos]);

  return (
    <div 
      id="graph-container" 
      className="w-full h-full relative"
      onMouseMove={handleMouseMove}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        onNodeHover={handleNodeHover}
        onNodeDragEnd={handleNodeDragEnd}
        backgroundColor="transparent"
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        minZoom={0.5}
        maxZoom={3}
        warmupTicks={100}
        cooldownTicks={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
      
      {/* 悬停信息提示 */}
      {hoveredNode && (
        <div
          className="absolute bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg p-3 pointer-events-none z-50"
          style={getTooltipPosition()}
        >
          <div className="text-sm font-medium text-white">{hoveredNode.label}</div>
          <div className="text-xs text-gray-400 mt-1">
            类型: {hoveredNode.type || '未知'}
          </div>
          {hoveredNode.description && (
            <div className="text-xs text-gray-500 mt-1">{hoveredNode.description}</div>
          )}
        </div>
      )}
    </div>
  );
});

ForceGraph.displayName = 'ForceGraph';