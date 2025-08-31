'use client';

import { useEffect, useRef, useState } from 'react';
import { KnowledgeGraphData, NODE_COLORS } from '@/lib/types/memory';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
  scale: number;
  offset: { x: number; y: number };
  onNodeClick: (nodeId: number) => void;
}

export function KnowledgeGraph({ data, scale, offset, onNodeClick }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // 处理画布大小
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // 绘制图谱
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || canvasSize.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 保存当前状态
      ctx.save();
      
      // 应用缩放和偏移
      ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      // 绘制边
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
      ctx.lineWidth = 2;
      
      data.edges.forEach(edge => {
        const fromNode = data.nodes.find(n => n.id === edge.from);
        const toNode = data.nodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        
        // 绘制边标签
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        ctx.fillStyle = '#6C7293';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, midX, midY - 5);
      });
      
      // 绘制节点
      data.nodes.forEach((node, index) => {
        // 添加浮动动画
        const floatY = Math.sin(animationFrame + index) * 0.5;
        const nodeY = node.y + floatY;
        
        // 节点光晕（悬停效果）
        if (hoveredNode === node.id) {
          const gradient = ctx.createRadialGradient(
            node.x, nodeY, 0,
            node.x, nodeY, node.size * 2
          );
          gradient.addColorStop(0, NODE_COLORS[node.type] + '60');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, nodeY, node.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 节点光晕（常规）
        const gradient = ctx.createRadialGradient(
          node.x, nodeY, 0,
          node.x, nodeY, node.size * 1.5
        );
        gradient.addColorStop(0, NODE_COLORS[node.type] + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, nodeY, node.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 节点圆形
        ctx.beginPath();
        ctx.arc(node.x, nodeY, node.size, 0, Math.PI * 2);
        ctx.fillStyle = NODE_COLORS[node.type];
        ctx.fill();
        
        // 节点边框（悬停效果）
        if (hoveredNode === node.id) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // 节点标签
        ctx.fillStyle = '#F5F5F5';
        ctx.font = `${hoveredNode === node.id ? 'bold ' : ''}14px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, nodeY);
      });
      
      // 恢复状态
      ctx.restore();
      
      animationFrame += 0.01;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [data, scale, offset, hoveredNode, canvasSize]);

  // 处理鼠标交互
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 应用逆变换计算实际坐标
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const actualX = (x - centerX - offset.x) / scale + centerX;
    const actualY = (y - centerY - offset.y) / scale + centerY;
    
    // 检查是否悬停在节点上
    let hovered = null;
    data.nodes.forEach(node => {
      const distance = Math.sqrt(
        Math.pow(actualX - node.x, 2) + Math.pow(actualY - node.y, 2)
      );
      if (distance <= node.size) {
        hovered = node.id;
      }
    });
    
    setHoveredNode(hovered);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode !== null) {
      onNodeClick(hoveredNode);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => setHoveredNode(null)}
    />
  );
}