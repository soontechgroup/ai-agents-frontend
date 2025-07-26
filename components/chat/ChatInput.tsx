'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, isVoice?: boolean) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  // 发送文字消息
  const handleSendMessage = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    onSendMessage(trimmedText);
    setText('');
    
    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // 处理键盘输入
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  // 开始录音
  const startRecording = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsRecording(true);
    
    // 模拟录音后发送
    recordingTimer.current = setTimeout(() => {
      if (isRecording) {
        onSendMessage('你好呀！很高兴和你通话，开启这次口才训练之旅。为了能给你制定更有针对性的训练方案，能否先简单跟我讲讲你的工作领域以及日常沟通场景呢？', true);
      }
    }, 2000);
  };

  // 停止录音
  const stopRecording = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
  };

  return (
    <div className="p-4 px-8 bg-[var(--bg-secondary)] border-t border-[var(--border-default)]">
      <div className="max-w-[900px] mx-auto flex gap-3 items-center">
        {/* 输入框容器 */}
        <div className="flex-1 relative bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-full flex items-center px-3 py-2 transition-all duration-300 focus-within:border-[var(--accent-primary)] focus-within:shadow-[var(--glow-sm)]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 px-3 py-1 bg-transparent text-[var(--text-primary)] text-sm resize-none outline-none min-h-[36px] max-h-[120px] leading-relaxed placeholder:text-[var(--text-muted)]"
            rows={1}
          />

          {/* 发送按钮 */}
          {text && (
            <button
              onClick={handleSendMessage}
              className="text-[var(--accent-primary)] flex items-center justify-center pr-2 transition-all duration-300 hover:scale-110 active:scale-90"
              title="发送"
            >
              <Send size={20} />
            </button>
          )}
        </div>

        {/* 麦克风按钮 */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--bg-primary)] text-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
            isRecording ? 'animate-pulse shadow-[var(--shadow-lg),var(--glow-md)]' : 'shadow-[var(--shadow-md)]'
          }`}
          title="按住说话"
        >
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
}