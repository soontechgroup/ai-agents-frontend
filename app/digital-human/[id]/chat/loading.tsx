'use client';

export default function DigitalHumanChatLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
        <p className="mt-4 text-[var(--text-secondary)]">正在加载数字人信息...</p>
      </div>
    </div>
  );
}