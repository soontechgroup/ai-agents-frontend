'use client';

import { forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { ForceGraphData, ForceGraphNode } from '@/lib/types/memory';

// 动态导入 ForceGraph 组件，禁用 SSR
const ForceGraph = dynamic(
  () => import('./ForceGraph').then(mod => mod.ForceGraph),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-cyan-500 rounded-full animate-pulse"
                style={{
                  top: `${[0, 20, 68, 48, 34][i]}px`,
                  left: `${[34, 60, 48, 0, 34][i]}px`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          <div className="text-gray-400 text-sm">正在加载知识图谱...</div>
        </div>
      </div>
    )
  }
);

interface ForceGraphWrapperProps {
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

export const ForceGraphWrapper = forwardRef<any, ForceGraphWrapperProps>((props, ref) => {
  return <ForceGraph ref={ref} {...props} />;
});

ForceGraphWrapper.displayName = 'ForceGraphWrapper';