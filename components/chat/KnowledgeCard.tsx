'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, Tag } from 'lucide-react';

interface KnowledgeCardProps {
  content: string;
  metadata?: {
    entities?: any[];
    relationships?: any[];
    messageType?: string;
    originalData?: any;
    [key: string]: any;
  };
  timestamp?: string;
}

export default function KnowledgeCard({ content, metadata, timestamp }: KnowledgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 解析知识数据
  let entities: any[] = [];
  let relationships: any[] = [];
  let summary = '';

  if (metadata?.originalData) {
    const data = metadata.originalData;
    entities = data.entities || data.nodes || data.concepts || [];
    relationships = data.relationships || data.edges || data.connections || [];

    // 生成摘要
    if (data.summary) {
      summary = data.summary;
    } else if (entities.length > 0) {
      const names = entities.slice(0, 3).map(e => e.name || e.label || e.concept).filter(Boolean);
      if (names.length > 0) {
        summary = `关键概念: ${names.join(', ')}${entities.length > 3 ? ' 等' : ''}`;
      }
    }
  } else {
    entities = metadata?.entities || [];
    relationships = metadata?.relationships || [];
  }

  const entityCount = entities.length;
  const relationshipCount = relationships.length;

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1.5 bg-emerald-500/20 rounded">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-medium text-emerald-300">知识提取</div>
          {(entityCount > 0 || relationshipCount > 0) && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
                {entityCount} 知识点
              </span>
              {relationshipCount > 0 && (
                <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-400">
                  {relationshipCount} 关联
                </span>
              )}
            </div>
          )}
        </div>
        {summary && (
          <div className="text-sm text-gray-300 mb-2">
            {summary}
          </div>
        )}
        {!isExpanded && entities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entities.slice(0, 5).map((entity: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-400"
              >
                <Tag className="w-3 h-3" />
                {entity.name || entity.label || entity.concept || `知识${idx + 1}`}
              </span>
            ))}
            {entities.length > 5 && (
              <span className="text-xs text-gray-500">+{entities.length - 5}</span>
            )}
          </div>
        )}
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg group-hover:bg-emerald-500/15 transition-colors">
          <span className="text-xs text-emerald-400">
            {isExpanded ? '收起' : '查看详情'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
          {(entities.length > 0 || relationships.length > 0) ? (
            <div className="space-y-3">
              {entities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-400">知识点详情</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {entities.map((entity: any, index: number) => {
                      const name = entity.name || entity.label || entity.concept || `知识${index + 1}`;
                      const type = entity.type || entity.category || '';
                      const desc = entity.description || entity.definition || '';
                      const props = entity.properties || entity.attributes || {};

                      return (
                        <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-sm font-medium text-gray-200">{name}</span>
                            </div>
                            {type && (
                              <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
                                {type}
                              </span>
                            )}
                          </div>
                          {desc && (
                            <p className="mt-1 text-xs text-gray-400">{desc}</p>
                          )}
                          {Object.keys(props).length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {Object.entries(props).slice(0, 3).map(([k, v]) => (
                                <div key={k}>
                                  {k}: {String(v)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {relationships.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-400">关联关系</span>
                  </div>
                  <div className="space-y-1">
                    {relationships.map((rel: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs p-2 bg-gray-800/50 rounded">
                        <span className="text-blue-400">{rel.source || rel.from}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-purple-400">{rel.type || rel.relationship || '关联'}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400">{rel.target || rel.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              {content || '暂无提取的知识'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}