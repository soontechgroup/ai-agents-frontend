'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Loader2, CheckCircle } from 'lucide-react';
import { TrainingMessage, DigitalHuman } from '@/lib/types/digital-human';

interface TrainingChatProps {
  messages: TrainingMessage[];
  onSendMessage: (message: string) => void;
  isTraining: boolean;
  digitalHuman: DigitalHuman;
}

export default function TrainingChat({
  messages,
  onSendMessage,
  isTraining,
  digitalHuman
}: TrainingChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoad = useRef(true);
  const previousMessageCount = useRef(0);

  // 自动滚动到底部
  const scrollToBottom = (smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  };

  useEffect(() => {
    // 如果是初始加载（历史记录），直接跳到底部（不要动画）
    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
      previousMessageCount.current = messages.length;
      // 使用 setTimeout 确保 DOM 更新后再滚动
      setTimeout(() => {
        scrollToBottom(false); // false = 不要动画，直接跳到底部
      }, 0);
      return;
    }
    
    // 只有新增消息时才滚动（带动画）
    if (messages.length > previousMessageCount.current && 
        messages.length - previousMessageCount.current <= 2) {
      scrollToBottom(true); // true = 平滑滚动
    }
    
    previousMessageCount.current = messages.length;
  }, [messages]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTraining) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* 头像 */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white'
            }`}>
              {message.role === 'user' ? '我' : '🤖'}
            </div>
            
            {/* 消息内容 */}
            <div className={`flex flex-col gap-1 max-w-[70%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className="text-xs text-gray-500">
                {message.role === 'user' ? '训练者' : digitalHuman.name}
              </div>
              <div className={`relative px-4 py-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-gray-200'
                  : 'bg-gray-700/50 border border-gray-600 text-gray-200'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {/* 有效训练标记 */}
                {message.extractedKnowledge && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* 训练中指示器 */}
        {isTraining && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white flex items-center justify-center">
              🤖
            </div>
            <div className="flex flex-col gap-1 items-start">
              <div className="text-xs text-gray-500">{digitalHuman.name}</div>
              <div className="px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-sm text-gray-400">正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入区域 */}
      <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入训练对话内容..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              rows={1}
              disabled={isTraining}
            />
          </div>
          
          <button
            type="button"
            className="p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors"
            disabled={isTraining}
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={!inputValue.trim() || isTraining}
          >
            <Send className="w-4 h-4" />
            <span>发送</span>
          </button>
        </form>
      </div>
    </div>
  );
}