import { useEffect, useState } from 'react';
import { MemoryType, FILTER_ICONS, FILTER_LABELS } from '@/lib/types/memory';
import { memoryService } from '@/lib/api/services/memory.service';
import { useParams } from 'next/navigation';

interface MemoryFiltersProps {
  activeFilter: MemoryType | null;
  onFilterChange: (filter: MemoryType | null) => void;
}

export function MemoryFilters({ activeFilter, onFilterChange }: MemoryFiltersProps) {
  const params = useParams();
  const digitalHumanId = params.id as string;
  const [typeStats, setTypeStats] = useState<Record<MemoryType, number> | null>(null);

  useEffect(() => {
    loadTypeStats();
  }, [digitalHumanId]);

  const loadTypeStats = async () => {
    try {
      const res = await memoryService.getMemoryTypeStats(digitalHumanId);
      if (res.code === 0) {
        setTypeStats(res.data);
      }
    } catch (error) {
      console.error('Failed to load type stats:', error);
    }
  };

  const filters = Object.values(MemoryType).map(type => ({
    type,
    label: FILTER_LABELS[type],
    icon: FILTER_ICONS[type],
    count: typeStats?.[type] || 0
  }));

  const handleFilterClick = (type: MemoryType) => {
    onFilterChange(activeFilter === type ? null : type);
  };

  return (
    <div className="p-5 border-b border-gray-800">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3.5">
        记忆类型
      </h3>
      <div className="space-y-2">
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => handleFilterClick(filter.type)}
            className={`
              w-full flex items-center px-4 py-3 rounded-md border transition-all
              ${activeFilter === filter.type
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-cyan-500/30 text-gray-300'
              }
            `}
          >
            <span className="text-xl mr-3">{filter.icon}</span>
            <span className="flex-1 text-left text-sm">{filter.label}</span>
            <span className={`
              text-xs px-2 py-0.5 rounded-full
              ${activeFilter === filter.type
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-gray-900 text-gray-500'
              }
            `}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}