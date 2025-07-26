'use client';

export default function ThinkingBubble({ digitalHumanAvatar = '🎤' }: { digitalHumanAvatar?: string }) {
  return (
    <div className="flex gap-4 max-w-[900px] w-full mx-auto animate-fadeIn">
      {/* 头像 */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-base font-semibold text-[var(--bg-primary)] flex-shrink-0">
        {digitalHumanAvatar}
      </div>

      {/* 思考动画 */}
      <div className="inline-flex items-center gap-2 px-6 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-2xl">
        <span className="text-[var(--text-secondary)]">正在思考</span>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-aiPulse"></span>
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-aiPulse animation-delay-200"></span>
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-aiPulse animation-delay-400"></span>
        </div>
      </div>
    </div>
  );
}