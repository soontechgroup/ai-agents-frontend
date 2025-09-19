import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
      <div className="text-center">
        <FileQuestion className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">数字人不存在</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          该数字人可能已被删除或您没有访问权限
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}