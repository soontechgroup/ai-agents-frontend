import { MemoryItem } from '@/lib/types/memory';

interface RecentMemoriesProps {
  memories: MemoryItem[];
  onMemoryClick: (memory: MemoryItem) => void;
}

export function RecentMemories({ memories, onMemoryClick }: RecentMemoriesProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {memories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-600 text-sm">暂无记忆数据</div>
        </div>
      ) : (
        memories.map((memory) => (
          <div
            key={memory.id}
            onClick={() => onMemoryClick(memory)}
            className={`
              p-4 border-b border-gray-800 cursor-pointer transition-all
              ${memory.active
                ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500'
                : 'hover:bg-gray-800/50'
              }
            `}
          >
            <div className="text-xs text-gray-500 mb-1">{memory.timestamp}</div>
            <div className="text-sm text-gray-300 line-clamp-2">
              {memory.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
}