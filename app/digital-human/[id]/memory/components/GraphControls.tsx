import { Plus, Minus, Target, Maximize2 } from 'lucide-react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
}

export function GraphControls({ onZoomIn, onZoomOut, onReset, onFullscreen }: GraphControlsProps) {
  const controls = [
    { icon: Plus, onClick: onZoomIn, title: '放大' },
    { icon: Minus, onClick: onZoomOut, title: '缩小' },
    { icon: Target, onClick: onReset, title: '重置视图' },
    { icon: Maximize2, onClick: onFullscreen, title: '全屏' }
  ];

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {controls.map((control, index) => {
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
  );
}