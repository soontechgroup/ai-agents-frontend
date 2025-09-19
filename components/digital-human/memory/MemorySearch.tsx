import { Search } from 'lucide-react';

interface MemorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MemorySearch({ value, onChange }: MemorySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索记忆内容..."
        className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
      />
    </div>
  );
}