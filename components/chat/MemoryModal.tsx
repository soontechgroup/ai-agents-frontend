'use client';

import { useState, useEffect } from 'react';
import { X, Brain, Database, Link2, Tag, Clock, Search, Cpu, Sparkles, User, Calendar, Hash, Activity } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  memory?: {  // 使用独立的 memory 字段
    type?: string;
    content?: string;
    metadata?: {
      count?: number;
      entities?: any[];
      nodes?: any[];
      edges?: any[];
      relationships?: any[];
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export default function MemoryModal({ isOpen, onClose, content, memory }: MemoryModalProps) {

  if (!isOpen) return null;


  // 解析记忆数据 - 从新的 memory 字段获取
  let parsedMemories: any[] = [];
  let relationships: any[] = [];

  // 从 memory 字段获取数据
  if (memory?.metadata) {
    // 优先从 memory.metadata 获取
    parsedMemories = memory.metadata.entities || memory.metadata.nodes || memory.metadata.memories || [];
    relationships = memory.metadata.relationships || memory.metadata.relations || memory.metadata.edges || [];
  } else if (memory) {
    // 从 memory 根级别获取
    parsedMemories = memory.entities || memory.nodes || memory.memories || memory.data || [];
    relationships = memory.relationships || memory.relations || memory.edges || [];

    // 检查是否有嵌套的data字段
    if (memory.data && typeof memory.data === 'object' && !Array.isArray(memory.data)) {
      parsedMemories = memory.data.memories || memory.data.entities || memory.data.nodes || memory.data.results || parsedMemories;
      relationships = memory.data.relationships || memory.data.relations || memory.data.edges || relationships;
    }

    // 如果有content字段，尝试解析
    if (memory.content && typeof memory.content === 'string') {
      try {
        const parsed = JSON.parse(memory.content);
        if (parsed.memories || parsed.entities || parsed.nodes) {
          parsedMemories = parsed.memories || parsed.entities || parsed.nodes || [];
          relationships = parsed.relationships || parsed.relations || parsed.edges || [];
        }
      } catch (e) {
        // 解析失败，继续尝试其他方式
      }
    }
  }

  // 如果还是没有，尝试解析content
  if (parsedMemories.length === 0 && content) {
    try {
      // 尝试直接解析content
      const parsed = JSON.parse(content);
      parsedMemories = parsed.memories || parsed.entities || parsed.nodes || parsed.data || [];
      relationships = parsed.relationships || parsed.relations || parsed.edges || [];
    } catch {
      // 如果有JSON子串
      if (content.includes('{')) {
        try {
          const jsonStr = content.substring(content.indexOf('{'));
          const parsed = JSON.parse(jsonStr);
          parsedMemories = parsed.memories || parsed.entities || parsed.nodes || parsed.data || [];
          relationships = parsed.relationships || parsed.relations || parsed.edges || [];
        } catch (e) {
          // JSON 解析失败，使用默认值
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹框内容 */}
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">记忆网络</h3>
              {parsedMemories.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  共 {parsedMemories.length} 条相关记忆
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>


        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {/* 如果有记忆数据，显示列表 */}
          {parsedMemories.length > 0 ? (
            <div className="space-y-3">
              {parsedMemories.map((memory: any, index: number) => {
                // 处理不同的数据格式
                const name = memory.name || memory.entity || memory.subject || memory.node_name || `记忆 #${index + 1}`;
                const type = memory.type || memory.node_type || memory.label || '';
                const description = memory.description || memory.content || memory.text || '';
                const properties = memory.properties || memory.attributes || {};
                const confidence = memory.confidence || memory.score || memory.weight;

                // 根据类型选择图标和颜色
                const getIconAndColor = (type: string) => {
                  const lowerType = (type || '').toLowerCase();
                  if (lowerType.includes('person') || lowerType.includes('人')) {
                    return { icon: User, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-400' };
                  }
                  if (lowerType.includes('event') || lowerType.includes('事件')) {
                    return { icon: Calendar, bgColor: 'bg-green-500/10', iconColor: 'text-green-400' };
                  }
                  if (lowerType.includes('fact') || lowerType.includes('事实')) {
                    return { icon: Activity, bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-400' };
                  }
                  return { icon: Brain, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-400' };
                };

                const { icon: Icon, bgColor, iconColor } = getIconAndColor(type);

                return (
                  <div
                    key={index}
                    className="group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-800/20 border border-gray-700/50 rounded-xl hover:from-gray-800/60 hover:to-gray-800/40 hover:border-purple-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 ${bgColor} rounded-lg`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-100 mb-1">
                              {name}
                            </h4>
                            {type && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-800/60 rounded-md">
                                <Tag className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{type}</span>
                              </div>
                            )}
                          </div>
                          {confidence && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-lg">
                              <Activity className="w-3 h-3 text-purple-400" />
                              <span className="text-xs text-purple-400">
                                {typeof confidence === 'number' ?
                                  (confidence > 1 ? confidence.toFixed(0) : (confidence * 100).toFixed(0)) : confidence}%
                              </span>
                            </div>
                          )}
                        </div>

                        {description && (
                          <p className="mt-2.5 text-sm text-gray-300 leading-relaxed">
                            {description}
                          </p>
                        )}

                        {Object.keys(properties).length > 0 && (
                          <div className="mt-3 p-3 bg-gray-800/40 rounded-lg">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Hash className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-400">详细信息</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                              {Object.entries(properties).slice(0, 5).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 text-xs">
                                  <span className="text-gray-500 min-w-[80px]">{key}:</span>
                                  <span className="text-gray-300 break-all">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                              {Object.keys(properties).length > 5 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  还有 {Object.keys(properties).length - 5} 个属性...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {memory.timestamp && (
                          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-800">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {new Date(memory.timestamp).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (

            /* 根据消息类型和数据状态显示不同内容 */
            memory?.metadata?.count && memory.metadata.count > 0 && parsedMemories.length === 0 ? (
              /* 有记忆数量但没有解析到数据 */
              <div className="p-6">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-300">记忆数据加载中...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    系统检测到 {memory.metadata.count} 个相关记忆
                  </p>
                </div>

                {/* 显示数据状态详情 */}
                {memory && (
                  <details className="mt-4 p-3 bg-gray-800/20 rounded-lg">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                      查看数据状态
                    </summary>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">检测到的记忆:</span>
                        <span className="text-gray-300">{memory.metadata?.count || 0} 条</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">数据状态:</span>
                        <span className="text-yellow-400">正在解析中</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        系统正在处理记忆数据，请稍后查看详细内容
                      </div>
                    </div>
                  </details>
                )}
              </div>
            ) : memory?.type === 'memory' ? (
              <div className="p-6">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">
                    {memory?.metadata?.count === 0 ? '未找到相关记忆' : '记忆检索已完成'}
                  </p>
                  {memory?.metadata?.count === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      系统暂时没有找到与此相关的历史记忆
                    </p>
                  )}
                </div>
              </div>
            ) : memory?.type === 'thinking' ? (
              /* 思考类型 */
              <div className="p-6">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">思考过程已完成</p>
                </div>
              </div>
            ) : memory?.type === 'knowledge' ? (
              /* 知识类型 */
              <div className="p-6">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">知识提取已完成</p>
                </div>
              </div>
            ) : (
              /* 默认状态 */
              <div className="text-center py-6">
                <p className="text-gray-400">暂无记忆数据</p>
                <p className="text-xs text-gray-500 mt-2">
                  系统正在建立记忆网络
                </p>
              </div>
            )
          )}

          {/* 关联关系 */}
          {relationships && relationships.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/20 rounded-xl">
              <h4 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" />
                知识图谱关联
                <span className="ml-auto text-xs text-gray-400">
                  {relationships.length} 条关系
                </span>
              </h4>
              <div className="space-y-2">
                {relationships.slice(0, 5).map((rel: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2.5 bg-gray-800/40 rounded-lg">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded">
                      <span className="text-xs font-medium text-blue-400">{rel.source || rel.from}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">→</span>
                      <span className="text-xs text-purple-300 font-medium px-2 py-0.5 bg-purple-500/10 rounded">
                        {rel.type || rel.relationship || '关联'}
                      </span>
                      <span className="text-gray-600">→</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded">
                      <span className="text-xs font-medium text-green-400">{rel.target || rel.to}</span>
                    </div>
                  </div>
                ))}
                {relationships.length > 5 && (
                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      还有 {relationships.length - 5} 条关联关系
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}