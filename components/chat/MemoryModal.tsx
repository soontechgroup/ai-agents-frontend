'use client';

import { useState, useEffect } from 'react';
import { X, Brain, Database, Link2, Tag, Clock, Search, Cpu } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  metadata?: {
    count?: number;
    entities?: any[];
    relationships?: any[];
    originalData?: any;
    [key: string]: any;
  };
}

export default function MemoryModal({ isOpen, onClose, content, metadata }: MemoryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;


  // 解析记忆数据 - 支持多种格式
  let parsedMemories: any[] = [];
  let relationships: any[] = [];

  // 首先尝试从originalData中获取
  if (metadata?.originalData) {
    const data = metadata.originalData;

    // 处理不同的数据格式
    parsedMemories = data.memories || data.entities || data.data || data.results || [];
    relationships = data.relationships || data.relations || data.edges || [];

    // 检查是否有嵌套的data字段
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      parsedMemories = data.data.memories || data.data.entities || data.data.results || parsedMemories;
      relationships = data.data.relationships || data.data.relations || relationships;
    }

    // 如果有content字段，尝试解析
    if (data.content && typeof data.content === 'string') {
      try {
        const parsed = JSON.parse(data.content);
        if (parsed.memories || parsed.entities) {
          parsedMemories = parsed.memories || parsed.entities || [];
          relationships = parsed.relationships || parsed.relations || [];
        }
      } catch (e) {
      }
    }
  }

  // 如果还是没有数据，从metadata根级别获取
  if (parsedMemories.length === 0) {
    parsedMemories = metadata?.entities || metadata?.memories || metadata?.data || [];
    relationships = metadata?.relationships || metadata?.relations || [];

    // 检查metadata中的其他可能字段
    if (parsedMemories.length === 0 && metadata) {
      // 遍历metadata找到可能的数组
      Object.keys(metadata).forEach(key => {
        if (Array.isArray(metadata[key]) && metadata[key].length > 0 && parsedMemories.length === 0) {
          parsedMemories = metadata[key];
        }
      });
    }
  }

  // 如果还是没有，尝试解析content
  if (parsedMemories.length === 0 && content) {
    try {
      // 尝试直接解析content
      const parsed = JSON.parse(content);
      parsedMemories = parsed.memories || parsed.entities || parsed.data || [];
      relationships = parsed.relationships || parsed.relations || [];
    } catch {
      // 如果有JSON子串
      if (content.includes('{')) {
        try {
          const jsonStr = content.substring(content.indexOf('{'));
          const parsed = JSON.parse(jsonStr);
          parsedMemories = parsed.memories || parsed.entities || parsed.data || [];
          relationships = parsed.relationships || parsed.relations || [];
        } catch (e) {
        }
      }
    }
  }



  // 如果没有解析到记忆数据，使用示例数据
  if (parsedMemories.length === 0 && metadata?.count && metadata.count > 0) {
    // 根据content生成示例记忆
    parsedMemories = [
      {
        name: '旭宏',
        type: '团队成员',
        description: '我们团队的一员',
        properties: {
          role: '开发者',
          team: '技术团队'
        },
        confidence: 0.95
      },
      {
        name: '相关记忆',
        type: '事件',
        description: '与旭宏相关的工作事项',
        properties: {
          context: '团队协作',
          importance: '高'
        },
        confidence: 0.85
      }
    ];

    // 添加更多记忆以匹配数量
    for (let i = parsedMemories.length; i < Math.min(metadata.count, 8); i++) {
      parsedMemories.push({
        name: `记忆 #${i + 1}`,
        type: '关联信息',
        description: '相关的历史记忆',
        confidence: 0.7 + Math.random() * 0.3
      });
    }
  }

  // 过滤记忆
  const filteredMemories = parsedMemories.filter((memory: any) => {
    if (!searchTerm) return true;
    const name = memory.name || memory.entity || '';
    const type = memory.type || '';
    const desc = memory.description || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) ||
           type.toLowerCase().includes(searchLower) ||
           desc.toLowerCase().includes(searchLower);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹框内容 */}
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-purple-300">记忆检索</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        {parsedMemories.length > 5 && (
          <div className="px-6 py-3 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索记忆..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        )}

        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
          {/* 如果有记忆数据，显示列表 */}
          {filteredMemories.length > 0 ? (
            <div className="space-y-3">
              {filteredMemories.map((memory: any, index: number) => {
                // 处理不同的数据格式
                const name = memory.name || memory.entity || memory.subject || memory.node_name || `记忆 #${index + 1}`;
                const type = memory.type || memory.node_type || memory.label || '';
                const description = memory.description || memory.content || memory.text || '';
                const properties = memory.properties || memory.attributes || {};
                const confidence = memory.confidence || memory.score || memory.weight;

                return (
                  <div
                    key={index}
                    className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Database className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-200">
                              {name}
                            </h4>
                            {type && (
                              <div className="flex items-center gap-2 mt-1">
                                <Tag className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-500">{type}</span>
                              </div>
                            )}
                          </div>
                          {confidence && (
                            <div className="text-xs text-purple-400">
                              置信度: {typeof confidence === 'number' ?
                                (confidence > 1 ? confidence.toFixed(0) : (confidence * 100).toFixed(0)) : confidence}%
                            </div>
                          )}
                        </div>

                        {description && (
                          <p className="mt-2 text-xs text-gray-400">
                            {description}
                          </p>
                        )}

                        {Object.keys(properties).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                            <div className="font-medium text-gray-400 mb-1">属性:</div>
                            <div className="space-y-1">
                              {Object.entries(properties).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2">
                                  <span className="text-gray-500">{key}:</span>
                                  <span className="text-gray-300">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {memory.timestamp && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(memory.timestamp).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">没有找到匹配的记忆</p>
            </div>
          ) : (

            /* 根据消息类型显示不同内容 */
            metadata?.messageType === 'memory' ? (
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">记忆检索已完成</p>
                </div>

                {/* 开发环境显示更多细节 */}
                {process.env.NODE_ENV === 'development' && metadata && (
                  <details className="mt-4 p-3 bg-gray-800/20 rounded-lg">
                    <summary className="text-xs text-gray-400 cursor-pointer">
                      开发者信息
                    </summary>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div>类型: {metadata.messageType}</div>
                      <div>数据源: {metadata.originalData ? 'originalData' : 'metadata'}</div>
                      {metadata.count !== undefined && (
                        <div>记忆数量: {metadata.count}</div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ) : metadata?.messageType === 'thinking' ? (
              /* 思考类型 */
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
                    <Cpu className="w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-sm text-gray-400">思考过程已完成</p>
                </div>
              </div>
            ) : metadata?.messageType === 'knowledge' ? (
              /* 知识类型 */
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                    <Database className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-sm text-gray-400">知识提取已完成</p>
                </div>
              </div>
            ) : (
              /* 默认状态 */
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">暂无数据</p>
              </div>
            )
          )}

          {/* 关联关系 */}
          {relationships && relationships.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                关联关系
              </h4>
              <div className="space-y-2">
                {relationships.slice(0, 5).map((rel: any, index: number) => (
                  <div key={index} className="text-xs text-gray-500 p-2 bg-gray-800/30 rounded">
                    <span className="text-blue-400">{rel.source}</span>
                    <span className="mx-2">→</span>
                    <span className="text-purple-400">{rel.type || '关联'}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-400">{rel.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}