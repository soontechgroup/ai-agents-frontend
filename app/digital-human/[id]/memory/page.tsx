'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryStats } from './components/MemoryStats';
import { MemorySearch } from './components/MemorySearch';
import { RecentMemories } from './components/RecentMemories';
import { KnowledgeGraph, KnowledgeGraphHandle } from './components/KnowledgeGraph';
import { GraphControls } from './components/GraphControls';
import { MemoryDetail } from './components/MemoryDetail';
import { TrainingHistory } from './components/TrainingHistory';
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
  const graphRef = useRef<KnowledgeGraphHandle>(null);

  // 状态管理
  const [stats, setStats] = useState<MemoryStatsType | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [memoryGraphData, setMemoryGraphData] = useState<MemoryGraphResponse | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryDetailType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [trainingHistoryOpen, setTrainingHistoryOpen] = useState(false);
  const [graphScale, setGraphScale] = useState(1);
  const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<string[]>([]);

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
      // 并行获取记忆图谱和统计数据
      const [graphRes, statsRes] = await Promise.all([
        memoryService.getMemoryGraph(digitalHumanId, 100),
        memoryService.getMemoryStats(digitalHumanId, false)
      ]);

      if ((graphRes.code === 0 || graphRes.code === 200) && graphRes.data) {
        setMemoryGraphData(graphRes.data);
        
        // 设置统计数据（优先使用统计API的数据）
        if ((statsRes.code === 0 || statsRes.code === 200) && statsRes.data) {
          setStats({
            totalNodes: statsRes.data.total_nodes,
            totalEdges: statsRes.data.total_edges,
            documentCount: Object.values(statsRes.data.node_categories || {}).reduce((a, b) => a + b, 0),
            vectorCoverage: statsRes.data.network_density * 100
          });
        } else {
          // 降级方案：从图谱数据中提取统计
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
        }
        
        // 转换为可视化图谱数据
        const nodes = graphRes.data.nodes.map((node, index) => ({
          id: node.id,
          x: Math.random() * 800,
          y: Math.random() * 600,
          label: node.label,
          type: node.type,
          size: 5 + (node.confidence || 0.5) * 10,  // 基础大小5，根据置信度增加0-10
          color: getNodeColor(node.confidence),
          description: node.properties?.description,
          confidence: node.confidence
        }));
        
        const edges = graphRes.data.edges.map(edge => ({
          source: edge.source,
          target: edge.target,
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
      if ((res.code === 0 || res.code === 200) && res.data) {
        // 转换搜索结果为 MemoryItem 格式
        const searchMemories = res.data.map(node => ({
          id: node.id,
          content: node.properties?.description || node.label,
          timestamp: node.updated_at || new Date().toISOString(),
          preview: node.label
        }));
        setMemories(searchMemories);
      }
    } catch (error) {
      setMemories([]);
    }
  };

  const handleMemoryClick = async (memory: MemoryItem) => {
    try {
      const res = await memoryService.getMemoryDetail(digitalHumanId, memory.id);
      if ((res.code === 0 || res.code === 200) && res.data) {
        // 转换详情数据格式
        const detail: MemoryDetailType = {
          id: res.data.node.id,
          title: res.data.node.label,
          content: res.data.node.properties?.description || res.data.node.label,
          relations: res.data.relations.map(rel => ({
            source: rel.source,
            relation: rel.type,
            target: rel.target
          })),
          similarity: res.data.node.confidence,
          tags: Object.entries(res.data.node.properties || {})
            .filter(([key]) => key !== 'description')
            .map(([key, value], i) => ({
              id: String(i),
              name: `${key}: ${value}`
            })),
          timeline: []
        };
        setSelectedMemory(detail);
        setDetailPanelOpen(true);
      }
    } catch (error) {
      console.error('Failed to load memory detail:', error);
    }
  };

  const handleNodeClick = async (nodeId: string | number) => {
    // 通过节点ID获取记忆详情
    handleMemoryClick({ id: nodeId.toString() } as MemoryItem);
  };

  // 图谱控制功能
  const handleZoomIn = () => {
    graphRef.current?.zoomIn();
  };
  
  const handleZoomOut = () => {
    graphRef.current?.zoomOut();
  };
  
  const handleResetView = () => {
    graphRef.current?.zoomToFit();
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
    <motion.div 
      className="h-screen bg-gray-950 text-white overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
      <motion.header 
        className="absolute top-0 left-0 right-0 h-14 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-6 z-50"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-lg">
            🧠
          </div>
          <h1 className="text-lg font-semibold">数字人记忆体 - 知识图谱</h1>
        </div>
        <button
          onClick={() => setTrainingHistoryOpen(true)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          训练历史
        </button>
      </motion.header>

      {/* 主内容区 */}
      <div className="flex h-full pt-14">
        {/* 左侧面板 */}
        <motion.aside 
          className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 100 }}
        >
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
        </motion.aside>

        {/* 中间图谱区域 */}
        <div id="graph-container" className="flex-1 relative bg-gray-950 overflow-hidden" style={{ willChange: 'contents' }}>
          {graphData && graphData.nodes.length > 0 ? (
            <>
              <KnowledgeGraph
                ref={graphRef}
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
            <motion.div 
              className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-lg p-4 min-w-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
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
                  <div>总关系: {memoryGraphData.statistics.total_edges}</div>
                  {memoryGraphData.statistics.categories && Object.keys(memoryGraphData.statistics.categories).length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-gray-500">节点类型:</div>
                      {Object.entries(memoryGraphData.statistics.categories).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span>{type}:</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* 加载动画 */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-cyan-500 rounded-full"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1.2, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          delay: i * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          top: `${[0, 20, 68, 48, 34][i]}px`,
                          left: `${[34, 60, 48, 0, 34][i]}px`,
                        }}
                      />
                    ))}
                  </div>
                  <motion.div 
                    className="text-gray-400 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    正在加载记忆网络...
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 遮罩层 */}
        <AnimatePresence mode="wait">
          {detailPanelOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut"
              }}
              style={{ willChange: 'opacity' }}
              onClick={() => setDetailPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* 右侧详情面板 */}
        <MemoryDetail
          memory={selectedMemory}
          isOpen={detailPanelOpen}
          onClose={() => setDetailPanelOpen(false)}
        />
        
        {/* 训练历史弹窗 */}
        <TrainingHistory
          digitalHumanId={digitalHumanId}
          isOpen={trainingHistoryOpen}
          onClose={() => setTrainingHistoryOpen(false)}
        />
      </div>
    </motion.div>
  );
}