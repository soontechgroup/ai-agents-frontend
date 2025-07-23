'use client';

interface StatsGridProps {
  digitalHumans: number;
  conversations: number;
  trainingSessions: number;
}

export default function StatsGrid({ digitalHumans, conversations, trainingSessions }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="text-center p-4 bg-[rgba(22,33,62,0.8)] rounded-2xl border border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-[rgba(22,33,62,0.9)] hover:border-[#00D9FF] hover:transform hover:-translate-y-1 hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] relative overflow-hidden min-h-[100px] flex flex-col justify-center items-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] opacity-0 transition-opacity duration-300 hover:opacity-100" />
        <div className="text-3xl font-bold text-[#00D9FF] mb-1 leading-tight">
          {digitalHumans}
        </div>
        <div className="text-sm text-[#B8BCC8] font-normal whitespace-nowrap">
          数字人
        </div>
      </div>

      <div className="text-center p-4 bg-[rgba(22,33,62,0.8)] rounded-2xl border border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-[rgba(22,33,62,0.9)] hover:border-[#00D9FF] hover:transform hover:-translate-y-1 hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] relative overflow-hidden min-h-[100px] flex flex-col justify-center items-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] opacity-0 transition-opacity duration-300 hover:opacity-100" />
        <div className="text-3xl font-bold text-[#00D9FF] mb-1 leading-tight">
          {conversations}
        </div>
        <div className="text-sm text-[#B8BCC8] font-normal whitespace-nowrap">
          总对话数
        </div>
      </div>

      <div className="text-center p-4 bg-[rgba(22,33,62,0.8)] rounded-2xl border border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-[rgba(22,33,62,0.9)] hover:border-[#00D9FF] hover:transform hover:-translate-y-1 hover:shadow-[0_4px_6px_rgba(0,217,255,0.1)] relative overflow-hidden min-h-[100px] flex flex-col justify-center items-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] opacity-0 transition-opacity duration-300 hover:opacity-100" />
        <div className="text-3xl font-bold text-[#00D9FF] mb-1 leading-tight">
          {trainingSessions}
        </div>
        <div className="text-sm text-[#B8BCC8] font-normal whitespace-nowrap">
          训练次数
        </div>
      </div>
    </div>
  );
}