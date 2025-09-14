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
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<ForceGraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodeScreenPos, setNodeScreenPos] = useState<{ x: number; y: number } | null>(null);

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

  // 节点动画参数
  const [nodeAnimations, setNodeAnimations] = useState<Map<string | number, number>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    // 初始化节点动画
    const animations = new Map<string | number, number>();
    const startTime = Date.now();
    data.nodes.forEach((node, index) => {
      animations.set(node.id, startTime + index * 50); // 每个节点延迟50ms出现
    });
    setNodeAnimations(animations);
  }, [data.nodes]);
  
  // 节点绘制
  const nodeCanvasObject = useCallback((node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || node.id.toString();
    const fontSize = 12 / globalScale;
    const nodeSize = Math.max(1, node.size || 5); // 确保节点大小至少为1
    const interactionRadius = nodeSize + 10; // 增大交互区域
    
    // 获取动画进度
    const animDelay = nodeAnimations.get(node.id) || Date.now();
    const animProgress = Math.min(1, (Date.now() - animDelay) / 500);
    
    if (animProgress < 1 && !animationFrameRef.current) {
      // 使用 requestAnimationFrame 触发重绘
      animationFrameRef.current = requestAnimationFrame(() => {
        // ForceGraph2D 没有 refresh 方法，移除这个调用
        animationFrameRef.current = null;
      });
    }
    
    // 选中或高亮状态
    const isSelected = selectedNodeId === node.id;
    const isHighlighted = highlightNodes.has(node.id);
    const isHovered = hoveredNode?.id === node.id;
    
    // 绘制节点光晕（带动画）
    if (isSelected || isHighlighted || isHovered) {
      ctx.save();
      ctx.globalAlpha = animProgress * 0.6;
      
      // 简化的单层光晕效果
      const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      const glowSize = nodeSize * 2 * pulseScale;
      
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, glowSize, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(
        node.x!, node.y!, nodeSize,
        node.x!, node.y!, glowSize
      );
      gradient.addColorStop(0, `${node.color}20`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }
    
    // 在悬停时显示交互区域
    if (isHovered) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, interactionRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#00D9FF';
      ctx.fill();
      ctx.restore();
    }
    
    // 绘制节点主体（带缩放动画）
    ctx.save();
    ctx.globalAlpha = animProgress;
    const scaleAnimation = 0.5 + animProgress * 0.5;
    const actualNodeRadius = Math.max(0.1, nodeSize * scaleAnimation); // 实际渲染半径，确保不为负数
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, actualNodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || '#00D9FF';
    ctx.fill();
    ctx.restore();
    
    
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
  }, [selectedNodeId, highlightNodes, hoveredNode, nodeAnimations]);

  // 边绘制（添加流动效果）
  const linkCanvasObject = useCallback((link: ForceGraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightLinks.has(`${link.source}-${link.target}`);
    const sourceNode = link.source as ForceGraphNode;
    const targetNode = link.target as ForceGraphNode;
    
    // 设置边样式
    ctx.strokeStyle = isHighlighted ? '#00D9FF' : 'rgba(0, 217, 255, 0.2)';
    ctx.lineWidth = (isHighlighted ? 2 : 0.5) / globalScale;
    
    // 绘制边
    ctx.beginPath();
    ctx.moveTo(sourceNode.x!, sourceNode.y!);
    ctx.lineTo(targetNode.x!, targetNode.y!);
    ctx.stroke();
    
    // 简化的高亮效果（移除粒子动画以提升性能）
    if (isHighlighted) {
      // 使用简单的发光效果替代粒子
      ctx.save();
      ctx.strokeStyle = '#00F5A0';
      ctx.lineWidth = 3 / globalScale;
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
      ctx.stroke();
      ctx.restore();
    }
    
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
    
    // 记录节点的屏幕位置（相对于 viewport）
    if (node && fgRef.current && fgRef.current.graph2ScreenCoords && containerRef.current) {
      const coords = fgRef.current.graph2ScreenCoords(node.x, node.y);
      const containerRect = containerRef.current.getBoundingClientRect();
      const canvas = containerRef.current.querySelector('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      
      
      // 对于 fixed 定位，我们需要相对于 viewport 的坐标
      // graph2ScreenCoords 返回的是相对于 canvas 元素的坐标
      // 需要加上 canvas 在 viewport 中的位置
      const viewportX = coords.x + (canvasRect?.left || 0);
      const viewportY = coords.y + (canvasRect?.top || 0);
      
      setNodeScreenPos({
        x: viewportX,
        y: viewportY
      });
    } else {
      setNodeScreenPos(null);
    }
    
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

  // 追踪鼠标位置（已不再需要）

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
    if (!hoveredNode || !nodeScreenPos || !fgRef.current) {
      return { left: 0, top: 0, opacity: 0, scale: 0.8 };
    }
    
    // 节点的基础大小
    const nodeSize = hoveredNode.size || 5;
    
    // 动画完成后的缩放系数（参考绘制函数）
    const scaleAnimation = 1; // 动画完成后是1
    
    // 在 graph 坐标系中的半径（与绘制函数一致）
    const graphRadius = nodeSize * scaleAnimation;
    
    // 将半径从 graph 坐标转换为屏幕像素
    // 通过计算节点中心和边缘点的屏幕坐标差值来获得准确的屏幕半径
    let screenRadius = graphRadius;
    if (fgRef.current.graph2ScreenCoords && hoveredNode.x !== undefined && hoveredNode.y !== undefined) {
      const centerScreen = fgRef.current.graph2ScreenCoords(hoveredNode.x, hoveredNode.y);
      const edgeScreen = fgRef.current.graph2ScreenCoords(hoveredNode.x, hoveredNode.y - graphRadius);
      screenRadius = Math.abs(centerScreen.y - edgeScreen.y);
    }
    
    // 动态计算间距：根据节点大小调整，节点越大间距越大
    const tooltipGap = nodeSize * 0.3; // 间距为节点大小的30%
    
    // 提示框的小三角要指向圆圈顶部
    // 获取 tooltip 的实际高度
    const tooltipHeight = tooltipRef.current?.offsetHeight || 120; // 使用实际高度或默认值
    
    return {
      left: nodeScreenPos.x,                          // 水平居中对齐
      top: nodeScreenPos.y - screenRadius - tooltipHeight - tooltipGap, // 提示框底部在圆圈顶部上方，间距随半径变化
      opacity: 1,
      scale: 1
    };
  }, [hoveredNode, nodeScreenPos]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
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
        backgroundColor="#030712"
        enableNodeDrag={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        minZoom={0.5}
        maxZoom={3}
        warmupTicks={100}
        cooldownTicks={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        nodeRelSize={15}
        nodePointerAreaPaint={(node: ForceGraphNode, color: string, ctx: CanvasRenderingContext2D) => {
          const nodeSize = node.size || 5;
          const interactionRadius = nodeSize + 15;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, interactionRadius, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
      
      
      {/* 悬停信息提示 - 暂时隐藏 */}
      {/* {hoveredNode && (() => {
        const tooltipPos = getTooltipPosition();
        return (
          <div
            ref={tooltipRef}
            className="fixed bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg p-3 pointer-events-none z-50 transition-all duration-200 ease-out shadow-xl"
            style={{
              left: `${tooltipPos.left}px`,
              top: `${tooltipPos.top}px`,
              opacity: tooltipPos.opacity,
              transform: `translate(-50%, 0) scale(${tooltipPos.scale})`,
              transformOrigin: 'center bottom'
            }}
          >
          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45" />
          
          <div className="relative">
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: hoveredNode.color || '#00D9FF' }} 
              />
              {hoveredNode.label}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              类型: {hoveredNode.type || '未知'}
            </div>
            {hoveredNode.confidence && (
              <div className="text-xs text-gray-400 mt-1">
                置信度: {(hoveredNode.confidence * 100).toFixed(0)}%
              </div>
            )}
            {hoveredNode.description && (
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700 max-w-xs">
                {hoveredNode.description}
              </div>
            )}
          </div>
        </div>
        );
      })()} */}
    </div>
  );
});

ForceGraph.displayName = 'ForceGraph';