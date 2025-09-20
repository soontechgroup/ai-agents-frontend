import { useState, useCallback, useRef, useEffect } from 'react';
import { conversationService } from '@/lib/api/services/conversation.service';
import { 
  Conversation, 
  ConversationWithMessages, 
  Message,
  ConversationCreate,
  ConversationChatRequest 
} from '@/lib/types/conversation';
import { SSEStreamProcessor } from '@/lib/utils/sse-parser';

export interface UseConversationOptions {
  digitalHumanId: number;
  autoCreate?: boolean;
}

export interface UseConversationReturn {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  error: string | null;
  createConversation: () => Promise<void>;
  loadMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

export function useConversation({ 
  digitalHumanId, 
  autoCreate = true 
}: UseConversationOptions): UseConversationReturn {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentStreamRef = useRef<boolean>(false);

  // 创建新会话
  const createConversation = useCallback(async () => {
    if (!digitalHumanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data: ConversationCreate = {
        digital_human_id: digitalHumanId,
        title: `对话-${new Date().toLocaleString('zh-CN')}`
      };
      
      const response = await conversationService.createConversation(data);

      if (response.data) {
        setConversation(response.data);
        // 不清空消息，保留已加载的历史消息
      } else {
        throw new Error('创建会话失败');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '创建会话失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [digitalHumanId]);

  // 加载会话消息历史
  const loadMessages = useCallback(async () => {
    if (!digitalHumanId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await conversationService.getConversationMessages({
        digital_human_id: digitalHumanId,
        limit: 100
      });

      if (response.data?.messages) {
        // 确保消息格式正确，添加缺失的 id 字段（如果需要）
        const formattedMessages = response.data.messages.map((msg, index) => ({
          ...msg,
          id: msg.id || Date.now() + index,
          digital_human_id: msg.digital_human_id || digitalHumanId
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '加载消息失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [digitalHumanId]);

  // 发送消息并处理流式响应
  const sendMessage = useCallback(async (content: string) => {
    if (!digitalHumanId || !content.trim() || currentStreamRef.current) {
      return;
    }

    // 中断之前的请求（如果有）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    currentStreamRef.current = true;

    // 添加用户消息到列表
    const userMessage: Message = {
      id: Date.now(),
      digital_human_id: digitalHumanId,
      role: 'user',
      content: content,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    setError(null);

    // AI消息ID，用于后续更新
    const aiMessageId = Date.now() + 1;
    let aiMessageCreated = false;

    try {
      const data: ConversationChatRequest = {
        digital_human_id: digitalHumanId,
        message: content,
        stream: true
      };

      // 使用POST方法的流式响应
      const response = await conversationService.chatStreamPost(data);
      
      if (!response.ok) {
        // 尝试读取错误信息
        let errorText = `请求失败: ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            errorText = text;
          }
        } catch {
          // 忽略读取错误
        }
        throw new Error(errorText);
      }

      // 使用SSE解析器处理流式响应
      const processor = new SSEStreamProcessor();
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let accumulatedContent = '';

      try {
        while (true) {
          // 检查是否被中断
          if (abortControllerRef.current?.signal.aborted) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          // 使用SSE处理器解析数据
          const parsedMessages = processor.processChunk(value);

          for (const parsed of parsedMessages) {
            if (parsed.type === 'done') {
              // 流结束
              break;
            } else if (parsed.type === 'error') {
              // 处理错误
              throw new Error(parsed.error || '流式响应错误');
            } else if (parsed.type === 'message') {
              // 检查是否是特殊类型的消息
              const messageType = parsed.metadata?.messageType;

              if (messageType && ['memory', 'thinking', 'knowledge'].includes(messageType)) {
                // 特殊类型的消息
                if (!aiMessageCreated) {
                  // 如果还没有创建AI消息，创建一个包含特殊类型的消息
                  const aiMessage: Message = {
                    id: aiMessageId,
                    digital_human_id: digitalHumanId,
                    role: 'assistant',
                    content: '', // 内容稍后会填充
                    type: messageType as 'memory' | 'thinking' | 'knowledge',
                    // 如果是 memory 类型，构造正确的 memory 对象结构
                    memory: messageType === 'memory' ? {
                      type: 'memory',
                      content: parsed.content || `找到 ${parsed.metadata?.entity_count || parsed.metadata?.count || 0} 个相关记忆`,
                      metadata: {
                        count: parsed.metadata?.entity_count || parsed.metadata?.count || 0,
                        entity_count: parsed.metadata?.entity_count || 0,
                        relationship_count: parsed.metadata?.relationship_count || 0,
                        has_memory: true,
                        entities: parsed.metadata?.originalData?.metadata?.entities || parsed.metadata?.entities || [],
                        nodes: parsed.metadata?.originalData?.metadata?.nodes || parsed.metadata?.nodes || [],
                        edges: parsed.metadata?.originalData?.metadata?.edges || parsed.metadata?.edges || [],
                        relationships: parsed.metadata?.originalData?.metadata?.relationships || parsed.metadata?.relationships || []
                      }
                    } : undefined,
                    metadata: messageType === 'memory' ? {
                      has_memory: true,
                      memory_count: parsed.metadata?.entity_count || parsed.metadata?.count || 0
                    } : parsed.metadata,
                    created_at: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, aiMessage]);
                  aiMessageCreated = true;
                } else {
                  // 如果消息已存在，更新其类型和相应字段
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          type: messageType as 'memory' | 'thinking' | 'knowledge',
                          memory: messageType === 'memory' ? {
                            type: 'memory',
                            content: parsed.content || `找到 ${parsed.metadata?.entity_count || parsed.metadata?.count || 0} 个相关记忆`,
                            metadata: {
                              count: parsed.metadata?.entity_count || parsed.metadata?.count || 0,
                              entity_count: parsed.metadata?.entity_count || 0,
                              relationship_count: parsed.metadata?.relationship_count || 0,
                              has_memory: true,
                              entities: parsed.metadata?.originalData?.metadata?.entities || parsed.metadata?.entities || [],
                              nodes: parsed.metadata?.originalData?.metadata?.nodes || parsed.metadata?.nodes || [],
                              edges: parsed.metadata?.originalData?.metadata?.edges || parsed.metadata?.edges || [],
                              relationships: parsed.metadata?.originalData?.metadata?.relationships || parsed.metadata?.relationships || []
                            }
                          } : msg.memory,
                          metadata: messageType === 'memory' ? {
                            ...msg.metadata,
                            has_memory: true,
                            memory_count: parsed.metadata?.entity_count || parsed.metadata?.count || 0
                          } : { ...msg.metadata, ...parsed.metadata }
                        }
                      : msg
                  ));
                }
              } else if (parsed.content) {
                // 普通文本消息，累积内容
                accumulatedContent += parsed.content;

                // 如果还没有创建AI消息，现在创建
                if (!aiMessageCreated) {
                  const aiMessage: Message = {
                    id: aiMessageId,
                    digital_human_id: digitalHumanId,
                    role: 'assistant',
                    content: accumulatedContent,
                    type: 'text',
                    created_at: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, aiMessage]);
                  aiMessageCreated = true;
                } else {
                  // 更新已存在的AI消息内容
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err: any) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err?.message || '发送消息失败';
        setError(errorMessage);
        
        // 如果还没有创建AI消息，创建一个错误消息
        let errorContent = '抱歉，消息发送失败，请重试。';
        
        // 如果是后端特定错误，提供更详细的信息
        if (errorMessage.includes('InMemorySaver')) {
          errorContent = '抱歉，服务端会话管理出现问题，请联系管理员。';
        }
        
        const errorMsg: Message = {
          id: aiMessageId,
          digital_human_id: digitalHumanId,
          role: 'assistant',
          content: errorContent,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsThinking(false);
      currentStreamRef.current = false;
    }
  }, [digitalHumanId]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 自动创建会话
  useEffect(() => {
    if (autoCreate && digitalHumanId && !conversation) {
      createConversation();
    }
  }, [autoCreate, digitalHumanId, conversation, createConversation]);

  // 自动加载消息（只在初始化时加载一次）
  useEffect(() => {
    if (digitalHumanId && !messages.length) {
      loadMessages();
    }
  }, [digitalHumanId]); // 移除 loadMessages 依赖避免无限循环

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    conversation,
    messages,
    isLoading,
    isThinking,
    error,
    createConversation,
    loadMessages,
    sendMessage,
    clearError
  };
}