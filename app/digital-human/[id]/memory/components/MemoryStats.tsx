import { MemoryStats as MemoryStatsType } from '@/lib/types/memory';

interface MemoryStatsProps {
  stats: MemoryStatsType | null;
}

export function MemoryStats({ stats }: MemoryStatsProps) {
  const displayStats = stats || {
    totalNodes: 0,
    totalEdges: 0,
    documentCount: 0,
    vectorCoverage: 0
  };

  const statItems = [
    { label: '记忆节点', value: displayStats.totalNodes.toLocaleString(), color: 'from-cyan-500 to-cyan-600' },
    { label: '关系连接', value: displayStats.totalEdges.toLocaleString(), color: 'from-purple-500 to-purple-600' },
    { label: '文档片段', value: displayStats.documentCount.toLocaleString(), color: 'from-green-500 to-green-600' },
    { label: '向量覆盖', value: `${displayStats.vectorCoverage}%`, color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="p-5 border-b border-gray-800">
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3.5 text-center hover:scale-105 hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <div className={`text-xl font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              {item.value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}