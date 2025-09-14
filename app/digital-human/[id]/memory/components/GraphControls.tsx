import { 
  Plus, 
  Minus, 
  Target, 
  Maximize2, 
  Filter,
  Download,
  Settings,
  Layers,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onLayoutChange?: (layout: 'force' | 'radial' | 'hierarchical') => void;
  onExport?: () => void;
  onToggleLabels?: () => void;
  onSearch?: (query: string) => void;
}

export function GraphControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onFullscreen,
  onLayoutChange,
  onExport,
  onToggleLabels,
  onSearch
}: GraphControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'force' | 'radial' | 'hierarchical'>('force');
  const [showLabels, setShowLabels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLayoutChange = (layout: 'force' | 'radial' | 'hierarchical') => {
    setCurrentLayout(layout);
    onLayoutChange?.(layout);
  };

  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
    onToggleLabels?.();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const mainControls = [
    { icon: Plus, onClick: onZoomIn, title: '放大' },
    { icon: Minus, onClick: onZoomOut, title: '缩小' },
    { icon: Target, onClick: onReset, title: '重置视图' },
    { icon: Maximize2, onClick: onFullscreen, title: '全屏' }
  ];

  const advancedControls = [
    { icon: Search, onClick: () => setShowSearch(!showSearch), title: '搜索', active: showSearch },
    { icon: Settings, onClick: () => setShowSettings(!showSettings), title: '设置', active: showSettings },
    { icon: Download, onClick: onExport, title: '导出图片' }
  ];

  return (
    <>
      {/* 主控制按钮 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        {mainControls.map((control, index) => {
          const Icon = control.icon;
          return (
            <button
              key={index}
              onClick={control.onClick}
              title={control.title}
              className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center justify-center"
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

    </>
  );
}