'use client';

import { motion } from 'framer-motion';

export function MemoryItemSkeleton() {
  return (
    <motion.div
      className="bg-gray-800 border border-gray-700 rounded-lg p-3.5 cursor-not-allowed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded animate-pulse mb-2 w-3/4" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-5/6 mt-1" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="h-3 bg-gray-700 rounded animate-pulse w-24" />
        <div className="h-3 bg-gray-700 rounded animate-pulse w-16" />
      </div>
    </motion.div>
  );
}

export function MemoryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <MemoryItemSkeleton />
        </motion.div>
      ))}
    </div>
  );
}