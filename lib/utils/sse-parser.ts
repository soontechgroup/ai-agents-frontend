/**
 * SSE (Server-Sent Events) 数据解析工具
 */

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

export interface ParsedSSEData {
  type: 'message' | 'error' | 'done' | 'heartbeat';
  content?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * 解析SSE消息行
 */
export function parseSSELine(line: string): Partial<SSEMessage> | null {
  if (!line || line.trim() === '') {
    return null;
  }

  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }

  const field = line.substring(0, colonIndex).trim();
  const value = line.substring(colonIndex + 1).trim();

  switch (field) {
    case 'id':
      return { id: value };
    case 'event':
      return { event: value };
    case 'data':
      return { data: value };
    case 'retry':
      const retryValue = parseInt(value, 10);
      return !isNaN(retryValue) ? { retry: retryValue } : null;
    default:
      return null;
  }
}

/**
 * 解析完整的SSE消息块
 */
export function parseSSEMessage(chunk: string): SSEMessage[] {
  const messages: SSEMessage[] = [];
  const lines = chunk.split('\n');
  
  let currentMessage: Partial<SSEMessage> = {};
  let dataBuffer: string[] = [];

  for (const line of lines) {
    // 空行表示消息结束
    if (line.trim() === '') {
      if (dataBuffer.length > 0) {
        currentMessage.data = dataBuffer.join('\n');
        messages.push(currentMessage as SSEMessage);
        currentMessage = {};
        dataBuffer = [];
      }
      continue;
    }

    // 忽略注释行
    if (line.startsWith(':')) {
      continue;
    }

    const parsed = parseSSELine(line);
    if (parsed) {
      if ('data' in parsed) {
        dataBuffer.push(parsed.data!);
      } else {
        Object.assign(currentMessage, parsed);
      }
    }
  }

  // 处理最后一个消息（如果有）
  if (dataBuffer.length > 0) {
    currentMessage.data = dataBuffer.join('\n');
    messages.push(currentMessage as SSEMessage);
  }

  return messages;
}

/**
 * 解析SSE数据内容
 */
export function parseSSEData(data: string): ParsedSSEData {
  // 检查是否是结束标记
  if (data === '[DONE]') {
    return { type: 'done' };
  }

  // 检查是否是心跳包
  if (data === 'ping' || data === 'heartbeat') {
    return { type: 'heartbeat' };
  }

  try {
    const parsed = JSON.parse(data);
    
    // 检查是否是错误响应
    if (parsed.error) {
      return {
        type: 'error',
        error: parsed.error.message || '未知错误'
      };
    }

    // 提取消息内容
    if (parsed.content !== undefined) {
      return {
        type: 'message',
        content: parsed.content,
        metadata: parsed.metadata
      };
    }

    // 兼容其他格式
    if (parsed.message !== undefined) {
      return {
        type: 'message',
        content: parsed.message,
        metadata: parsed.metadata
      };
    }

    // 如果有choices数组（兼容OpenAI格式）
    if (parsed.choices && parsed.choices[0]?.delta?.content) {
      return {
        type: 'message',
        content: parsed.choices[0].delta.content,
        metadata: {
          model: parsed.model,
          usage: parsed.usage
        }
      };
    }

    // 默认返回原始数据
    return {
      type: 'message',
      content: JSON.stringify(parsed),
      metadata: parsed
    };
  } catch (error) {
    // 如果不是JSON，直接返回文本内容
    return {
      type: 'message',
      content: data
    };
  }
}

/**
 * 创建SSE流处理器
 */
export class SSEStreamProcessor {
  private buffer = '';
  private decoder = new TextDecoder();

  /**
   * 处理流数据块
   */
  processChunk(chunk: Uint8Array): ParsedSSEData[] {
    const text = this.decoder.decode(chunk, { stream: true });
    this.buffer += text;

    const results: ParsedSSEData[] = [];
    const messages = parseSSEMessage(this.buffer);

    for (const message of messages) {
      if (message.data) {
        const parsed = parseSSEData(message.data);
        results.push(parsed);
      }
    }

    // 清理已处理的数据
    const lastNewlineIndex = this.buffer.lastIndexOf('\n');
    if (lastNewlineIndex !== -1) {
      this.buffer = this.buffer.substring(lastNewlineIndex + 1);
    }

    return results;
  }

  /**
   * 重置处理器状态
   */
  reset() {
    this.buffer = '';
  }
}

/**
 * 辅助函数：从Response对象创建SSE流读取器
 */
export async function* readSSEStream(response: Response): AsyncGenerator<ParsedSSEData> {
  if (!response.body) {
    throw new Error('Response body is empty');
  }

  const reader = response.body.getReader();
  const processor = new SSEStreamProcessor();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      const messages = processor.processChunk(value);
      for (const message of messages) {
        yield message;
      }
    }
  } finally {
    reader.releaseLock();
  }
}