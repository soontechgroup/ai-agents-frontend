'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MemoryStats } from './components/MemoryStats';
import { MemorySearch } from './components/MemorySearch';
import { RecentMemories } from './components/RecentMemories';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { GraphControls } from './components/GraphControls';
import { MemoryDetail } from './components/MemoryDetail';
import { memoryService } from '@/lib/api/services/memory.service';
import {
  MemoryStats as MemoryStatsType,
  MemoryItem,
  KnowledgeGraphData,
  MemoryDetail as MemoryDetailType,
  MemoryGraphResponse,
  getNodeColor
} from '@/lib/types/memory';

export default function MemoryViewerPage() {
  const params = useParams();
  const digitalHumanId = params.id as string;

  // 状态管理
  const [stats, setStats] = useState<MemoryStatsType | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [memoryGraphData, setMemoryGraphData] = useState<MemoryGraphResponse | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryDetailType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [graphScale, setGraphScale] = useState(1);
  const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });

  // 加载初始数据
  useEffect(() => {
    loadInitialData();
  }, [digitalHumanId]);

  // 处理搜索变化
  useEffect(() => {
    if (!loading && searchQuery) {
      loadSearchResults();
    } else if (!loading && !searchQuery && memoryGraphData) {
      // 恢复显示所有记忆
      const allMemories = memoryGraphData.nodes.slice(0, 10).map(node => ({
        id: node.id,
        content: node.properties?.description || node.label,
        timestamp: node.updated_at || new Date().toISOString(),
        preview: node.label
      }));
      setMemories(allMemories);
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 获取记忆图谱数据
      const graphRes = await memoryService.getMemoryGraph(digitalHumanId, 100);

      if (graphRes.code === 0 && graphRes.data) {
        setMemoryGraphData(graphRes.data);
        
        // 设置统计数据
        setStats({
          totalNodes: graphRes.data.statistics.total_nodes,
          totalEdges: graphRes.data.statistics.total_edges,
          documentCount: graphRes.data.statistics.displayed_nodes,
          vectorCoverage: Math.min(
            (graphRes.data.statistics.displayed_nodes / 
             Math.max(graphRes.data.statistics.total_nodes, 1)) * 100,
            100
          )
        });
        
        // 转换为可视化图谱数据
        const nodes = graphRes.data.nodes.map((node, index) => ({
          id: node.id,
          x: Math.random() * 800,
          y: Math.random() * 600,
          label: node.label,
          type: node.type,
          size: node.size * 30,
          color: getNodeColor(node.confidence),
          description: node.properties?.description,
          confidence: node.confidence
        }));
        
        const edges = graphRes.data.edges.map(edge => ({
          from: edge.source,
          to: edge.target,
          label: edge.type,
          weight: edge.confidence
        }));
        
        setGraphData({ nodes, edges });
        
        // 设置最近记忆（取前10个节点）
        const recentMemories = graphRes.data.nodes.slice(0, 10).map(node => ({
          id: node.id,
          content: node.properties?.description || node.label,
          timestamp: node.updated_at || new Date().toISOString(),
          preview: node.label
        }));
        setMemories(recentMemories);
      }
    } catch (error) {
      console.error('Failed to load memory data:', error);
      // 设置默认空数据
      setStats({
        totalNodes: 0,
        totalEdges: 0,
        documentCount: 0,
        vectorCoverage: 0
      });
      setMemories([]);
      setGraphData({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadSearchResults = async () => {
    try {
      const res = await memoryService.searchMemory(digitalHumanId, searchQuery);
      if (res.code === 0) {
        setMemories(res.data || []);
      }
    } catch (error) {
      console.error('Failed to search memories:', error);
      setMemories([]);
    }
  };

  const handleMemoryClick = async (memory: MemoryItem) => {
    try {
      const res = await memoryService.getMemoryDetail(digitalHumanId, memory.id);
      if (res.code === 0 && res.data) {
        setSelectedMemory(res.data);
        setDetailPanelOpen(true);
      }
    } catch (error) {
      console.error('Failed to load memory detail:', error);
      // 可以在这里添加错误提示
    }
  };

  const handleNodeClick = async (nodeId: string | number) => {
    console.log('Page - Node clicked with ID:', nodeId);
    // 通过节点ID获取记忆详情
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
      </header>

      {/* 主内容区 */}
      <div className="flex h-full pt-14">
        {/* 左侧面板 */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* 记忆统计 */}
          <MemoryStats stats={stats} />

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
          {graphData && graphData.nodes.length > 0 ? (
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
          ) : !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 text-gray-600">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-gray-400">暂无记忆数据</p>
                <p className="text-gray-500 text-sm mt-2">数字人还没有形成知识图谱</p>
              </div>
            </div>
          )}

          {/* 图例说明 */}
          {graphData && graphData.nodes.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-lg p-4 min-w-[200px]">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">置信度图例</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00F5A0' }} />
                  <span>高置信度 (80%+)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00D9FF' }} />
                  <span>中高置信度 (60-80%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F7B731' }} />
                  <span>中置信度 (40-60%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B6B' }} />
                  <span>低置信度 (20-40%)</span>
                </div>
              </div>
              {memoryGraphData && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <div>总节点: {memoryGraphData.statistics.total_nodes}</div>
                  <div>显示节点: {memoryGraphData.statistics.displayed_nodes}</div>
                </div>
              )}
            </div>
          )}

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