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
        setMessages([]);
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
    if (!conversation?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await conversationService.getConversationMessages({
        conversation_id: conversation.id,
        limit: 100
      });
      
      if (response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '加载消息失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [conversation?.id]);

  // 发送消息并处理流式响应
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation?.id || !content.trim() || currentStreamRef.current) {
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
      conversation_id: conversation.id,
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
        conversation_id: conversation.id,
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
            } else if (parsed.type === 'message' && parsed.content) {
              // 累积内容
              accumulatedContent += parsed.content;
              
              // 如果还没有创建AI消息，现在创建
              if (!aiMessageCreated) {
                const aiMessage: Message = {
                  id: aiMessageId,
                  conversation_id: conversation.id,
                  role: 'assistant',
                  content: accumulatedContent,
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
          conversation_id: conversation?.id || 0,
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
  }, [conversation?.id]);

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

  // 自动加载消息
  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
    }
  }, [conversation?.id]);

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