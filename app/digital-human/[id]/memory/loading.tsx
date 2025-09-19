'use client';

import { motion } from 'framer-motion';

export default function MemoryViewerLoading() {
  return (
    <div className="h-screen bg-gray-950 text-white overflow-hidden relative">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-cyan-500 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  top: `${[0, 20, 68, 48, 34][i]}px`,
                  left: `${[34, 60, 48, 0, 34][i]}px`,
                }}
              />
            ))}
          </div>
          <motion.div
            className="text-gray-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            正在加载记忆网络...
          </motion.div>
        </div>
      </div>
    </div>
  );
}