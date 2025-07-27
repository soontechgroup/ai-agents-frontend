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
  const [speechError, setSpeechError] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setText(prev => prev + finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
        // 设置错误消息
        let errorMsg = '语音识别出错，请重试';
        if (event.error === 'no-speech') {
          errorMsg = '未检测到语音，请对着麦克风说话';
        } else if (event.error === 'not-allowed') {
          errorMsg = '请允许使用麦克风';
        } else if (event.error === 'network') {
          errorMsg = '网络错误，请检查网络连接';
        }
        setSpeechError(errorMsg);
        setTimeout(() => setSpeechError(''), 3000);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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


  // 切换语音识别
  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setSpeechError('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
      setTimeout(() => setSpeechError(''), 3000);
      return;
    }

    if (isRecording) {
      // 停止语音识别
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // 开始语音识别
      try {
        setSpeechError(''); // 清除之前的错误
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('启动语音识别失败:', error);
        setIsRecording(false);
        setSpeechError('语音识别启动失败，请重试');
        setTimeout(() => setSpeechError(''), 3000);
      }
    }
  };

  return (
    <div className="p-4 px-8 bg-[var(--bg-secondary)] border-t border-[var(--border-default)]">
      {/* 错误提示 */}
      {speechError && (
        <div className="max-w-[900px] mx-auto mb-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fadeIn">
          {speechError}
        </div>
      )}
      
      <div className="max-w-[900px] mx-auto flex gap-3 items-center">
        {/* 输入框容器 */}
        <div className={`flex-1 relative bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-full flex items-center px-3 py-2 transition-all duration-300 focus-within:border-[var(--accent-primary)] focus-within:shadow-[var(--glow-sm)] ${
          isRecording ? 'border-[var(--accent-primary)] shadow-[var(--glow-sm)]' : ''
        }`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "正在听您说话..." : "输入消息..."}
            className="flex-1 px-3 py-1 bg-transparent text-[var(--text-primary)] text-sm resize-none outline-none min-h-[36px] max-h-[120px] leading-relaxed placeholder:text-[var(--text-muted)]"
            rows={1}
            readOnly={isRecording}
          />

          {/* 语音识别指示器 */}
          {isRecording && (
            <div className="flex items-center gap-1 px-2">
              <span className="w-1 h-4 bg-[var(--accent-primary)] rounded-full animate-pulse"></span>
              <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full animate-pulse animation-delay-200"></span>
              <span className="w-1 h-3 bg-[var(--accent-primary)] rounded-full animate-pulse animation-delay-400"></span>
            </div>
          )}

          {/* 发送按钮 */}
          {text && !isRecording && (
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
          onClick={toggleVoiceRecognition}
          className={`w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--bg-primary)] text-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
            isRecording ? 'animate-pulse shadow-[var(--shadow-lg),var(--glow-md)]' : 'shadow-[var(--shadow-md)]'
          }`}
          title={isRecording ? "停止语音输入" : "开始语音输入"}
        >
          <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
}