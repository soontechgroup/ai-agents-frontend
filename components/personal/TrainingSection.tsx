'use client';

import Link from 'next/link';

interface TrainingItem {
  id: string;
  name: string;
  type: string;
  dataCount: number;
  status: 'completed' | 'training' | 'failed';
  icon: string;
  date: string;
}

interface TrainingSectionProps {
  trainingData?: TrainingItem[];
}

const getStatusColor = (status: TrainingItem['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-[#00F5A0]';
    case 'training':
      return 'bg-[#F7B731]';
    case 'failed':
      return 'bg-[#EE5A6F]';
    default:
      return 'bg-[#00F5A0]';
  }
};

const getStatusText = (status: TrainingItem['status']) => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'training':
      return '训练中';
    case 'failed':
      return '失败';
    default:
      return '已完成';
  }
};

export default function TrainingSection({ trainingData = [] }: TrainingSectionProps) {
  const hasTraining = trainingData.length > 0;

  return (
    <div className="bg-[#16213E] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 backdrop-blur-xl shadow-[0_10px_15px_rgba(0,217,255,0.15)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#F5F5F5] flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-[#00D9FF] to-[#7B68EE] rounded-full" />
          我的训练
        </h3>
        
        <Link 
          href="#" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] text-[#0A1628] rounded-md text-sm font-medium transition-all duration-300 shadow-[0_4px_6px_rgba(0,217,255,0.1)] hover:transform hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(0,217,255,0.15),0_0_20px_rgba(0,217,255,0.4)]"
        >
          <span>➕</span>
          <span>新建训练</span>
        </Link>
      </div>

      {hasTraining ? (
        <div className="flex flex-col gap-4">
            {trainingData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 bg-[rgba(0,217,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl transition-all duration-300 cursor-pointer hover:bg-[rgba(0,217,255,0.1)] hover:border-[#00D9FF] hover:transform hover:translate-x-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[rgba(0,217,255,0.1)] rounded-lg flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-[#F5F5F5]">
                      {item.name}
                    </div>
                    <div className="text-sm text-[#B8BCC8]">
                      {item.type} · {item.dataCount.toLocaleString()}条数据
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="text-[#F5F5F5]">{getStatusText(item.status)}</span>
                  </div>
                  <div className="text-sm text-[#6C7293]">
                    {item.date}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[#6C7293]">
          <div className="text-5xl mb-4 opacity-30">🎯</div>
          <p className="mb-6">还没有训练记录</p>
          <Link 
            href="#" 
            className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] text-[#0A1628] rounded-lg font-medium transition-all duration-300 shadow-[0_4px_6px_rgba(0,217,255,0.1)] hover:transform hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(0,217,255,0.15),0_0_20px_rgba(0,217,255,0.4)]"
          >
            <span>➕</span>
            <span>开始训练</span>
          </Link>
        </div>
      )}
    </div>
  );
}