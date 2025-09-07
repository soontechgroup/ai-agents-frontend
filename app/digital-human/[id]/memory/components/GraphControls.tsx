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

      {/* 高级控制按钮 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {advancedControls.map((control, index) => {
          const Icon = control.icon;
          return (
            <button
              key={index}
              onClick={control.onClick}
              title={control.title}
              className={`w-10 h-10 bg-gray-800 border rounded-lg transition-all flex items-center justify-center ${
                control.active 
                  ? 'border-cyan-500 text-cyan-400 bg-gray-700' 
                  : 'border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-cyan-500/50 hover:text-cyan-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* 搜索面板 */}
      {showSearch && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg p-4 z-20">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索节点..."
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
            >
              搜索
            </button>
          </form>
        </div>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg p-4 z-20 min-w-[250px]">
          <h3 className="text-sm font-medium text-white mb-3">图谱设置</h3>
          
          {/* 布局选择 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">布局方式</label>
            <div className="flex gap-2">
              {[
                { value: 'force', label: '力导向', icon: Layers },
                { value: 'radial', label: '径向', icon: Target },
                { value: 'hierarchical', label: '层级', icon: Filter }
              ].map(layout => {
                const Icon = layout.icon;
                return (
                  <button
                    key={layout.value}
                    onClick={() => handleLayoutChange(layout.value as any)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 ${
                      currentLayout === layout.value
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {layout.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 显示选项 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                onClick={handleToggleLabels}
                className="p-1"
              >
                {showLabels ? <Eye className="w-4 h-4 text-cyan-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
              </button>
              <span className="text-sm text-gray-300">显示节点标签</span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}