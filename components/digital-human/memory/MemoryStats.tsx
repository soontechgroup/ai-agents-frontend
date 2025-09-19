'use client';

import { MemoryStats as MemoryStatsType } from '@/lib/types/memory';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MemoryStatsProps {
  stats: MemoryStatsType | null;
}

export function MemoryStats({ stats }: MemoryStatsProps) {
  const displayStats = stats || {
    totalNodes: 0,
    totalEdges: 0,
    documentCount: 0,
    vectorCoverage: 0
  };
  
  // 数字动画状态
  const [animatedValues, setAnimatedValues] = useState({
    totalNodes: 0,
    totalEdges: 0,
    documentCount: 0,
    vectorCoverage: 0
  });
  
  // 数字递增动画
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setAnimatedValues({
        totalNodes: Math.floor(displayStats.totalNodes * easeProgress),
        totalEdges: Math.floor(displayStats.totalEdges * easeProgress),
        documentCount: Math.floor(displayStats.documentCount * easeProgress),
        vectorCoverage: displayStats.vectorCoverage * easeProgress
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(displayStats);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [displayStats.totalNodes, displayStats.totalEdges, displayStats.documentCount, displayStats.vectorCoverage]);

  const statItems = [
    { label: '记忆节点', value: animatedValues.totalNodes.toLocaleString(), color: 'from-cyan-500 to-cyan-600' },
    { label: '关系连接', value: animatedValues.totalEdges.toLocaleString(), color: 'from-purple-500 to-purple-600' },
    { label: '文档片段', value: animatedValues.documentCount.toLocaleString(), color: 'from-green-500 to-green-600' },
    { label: '向量覆盖', value: `${animatedValues.vectorCoverage.toFixed(1)}%`, color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="p-5 border-b border-gray-800">
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3.5 text-center cursor-pointer group"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className={`text-xl font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              {item.value}
            </motion.div>
            <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}