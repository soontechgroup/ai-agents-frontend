'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MemoryStats } from './components/MemoryStats';
import { MemoryFilters } from './components/MemoryFilters';
import { MemorySearch } from './components/MemorySearch';
import { RecentMemories } from './components/RecentMemories';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { GraphControls } from './components/GraphControls';
import { MemoryDetail } from './components/MemoryDetail';
import { memoryService } from '@/lib/api/services/memory.service';
import {
  MemoryStats as MemoryStatsType,
  MemoryItem,
  MemoryType,
  KnowledgeGraphData,
  MemoryDetail as MemoryDetailType
} from '@/lib/types/memory';

export default function MemoryViewerPage() {
  const params = useParams();
  const digitalHumanId = params.id as string;

  // 状态管理
  const [stats, setStats] = useState<MemoryStatsType | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryDetailType | null>(null);
  const [activeFilter, setActiveFilter] = useState<MemoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [graphScale, setGraphScale] = useState(1);
  const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });

  // 加载初始数据
  useEffect(() => {
    loadInitialData();
  }, [digitalHumanId]);

  // 处理过滤器变化
  useEffect(() => {
    loadMemories();
  }, [activeFilter, searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 并行加载所有数据
      const [statsRes, memoriesRes, graphRes] = await Promise.all([
        memoryService.getMemoryStats(digitalHumanId),
        memoryService.getMemoryList({ digitalHumanId }),
        memoryService.getKnowledgeGraph(digitalHumanId)
      ]);

      if (statsRes.code === 0) setStats(statsRes.data);
      if (memoriesRes.code === 0) setMemories(memoriesRes.data);
      if (graphRes.code === 0) setGraphData(graphRes.data);
    } catch (error) {
      console.error('Failed to load memory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemories = async () => {
    try {
      const res = await memoryService.getMemoryList({
        digitalHumanId,
        type: activeFilter || undefined,
        search: searchQuery || undefined
      });
      if (res.code === 0) {
        setMemories(res.data);
      }
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  };

  const handleMemoryClick = async (memory: MemoryItem) => {
    try {
      const res = await memoryService.getMemoryDetail(digitalHumanId, memory.id);
      if (res.code === 0) {
        setSelectedMemory(res.data);
        setDetailPanelOpen(true);
      }
    } catch (error) {
      console.error('Failed to load memory detail:', error);
    }
  };

  const handleNodeClick = async (nodeId: number) => {
    // 模拟通过节点ID获取记忆详情
    handleMemoryClick({ id: nodeId.toString() } as MemoryItem);
  };

  // 图谱控制功能
  const handleZoomIn = () => setGraphScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setGraphScale(prev => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setGraphScale(1);
    setGraphOffset({ x: 0, y: 0 });
  };
  const handleFullscreen = () => {
    const graphContainer = document.getElementById('graph-container');
    if (graphContainer) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        graphContainer.requestFullscreen();
      }
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* 网格背景 */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 顶部栏 */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 flex items-center px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-lg">
            🧠
          </div>
          <h1 className="text-lg font-semibold">数字人记忆体 - 知识图谱</h1>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
            <span>📊</span>
            <span>导出数据</span>
          </button>
          <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
            <span>🔄</span>
            <span>同步记忆</span>
          </button>
          <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm flex items-center gap-2 transition-colors">
            <span>⚙️</span>
            <span>设置</span>
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex h-full pt-14">
        {/* 左侧面板 */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* 记忆统计 */}
          {stats && <MemoryStats stats={stats} />}

          {/* 记忆类型过滤 */}
          <MemoryFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* 搜索和最近记忆 */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <MemorySearch value={searchQuery} onChange={setSearchQuery} />
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3">
              最近记忆
            </h3>
            <RecentMemories
              memories={memories}
              onMemoryClick={handleMemoryClick}
            />
          </div>
        </aside>

        {/* 中间图谱区域 */}
        <div id="graph-container" className="flex-1 relative bg-gray-950 overflow-hidden">
          {graphData && (
            <>
              <KnowledgeGraph
                data={graphData}
                scale={graphScale}
                offset={graphOffset}
                onNodeClick={handleNodeClick}
              />
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleResetView}
                onFullscreen={handleFullscreen}
              />
            </>
          )}

          {/* 图例说明 */}
          <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-lg p-4 min-w-[200px]">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">节点类型</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 bg-cyan-500 rounded-full" />
                <span>概念知识</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                <span>人物</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>事件</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 bg-purple-500 rounded-full" />
                <span>技能</span>
              </div>
            </div>
          </div>

          {/* 加载动画 */}
          {loading && (
            <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-50">
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
                <div className="text-gray-400 text-sm">正在加载记忆网络...</div>
              </div>
            </div>
          )}
        </div>

        {/* 遮罩层 */}
        {detailPanelOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setDetailPanelOpen(false)}
          />
        )}

        {/* 右侧详情面板 */}
        <MemoryDetail
          memory={selectedMemory}
          isOpen={detailPanelOpen}
          onClose={() => setDetailPanelOpen(false)}
        />
      </div>
    </div>
  );
}