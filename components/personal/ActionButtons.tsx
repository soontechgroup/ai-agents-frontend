'use client';

import Link from 'next/link';

export default function ActionButtons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <button className="group relative overflow-hidden font-medium py-3 px-6 rounded-lg border border-[rgba(255,255,255,0.1)] bg-transparent text-[#F5F5F5] backdrop-blur-[10px] text-center transition-all duration-300 hover:border-[#00D9FF] hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] hover:transform hover:-translate-y-1">
        <span className="relative z-10">训练</span>
      </button>

      <button className="group relative overflow-hidden font-medium py-3 px-6 rounded-lg border-transparent bg-gradient-to-r from-[#00D9FF] to-[#7B68EE] text-[#0A1628] text-center transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(0,217,255,0.15),0_0_20px_rgba(0,217,255,0.4)]">
        <span className="relative z-10 text-2xl">➕</span>
      </button>

      <button className="group relative overflow-hidden font-medium py-3 px-6 rounded-lg border border-[rgba(255,255,255,0.1)] bg-transparent text-[#F5F5F5] backdrop-blur-[10px] text-center transition-all duration-300 hover:border-[#00D9FF] hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] hover:transform hover:-translate-y-1">
        <span className="relative z-10">会话</span>
      </button>
    </div>
  );
}