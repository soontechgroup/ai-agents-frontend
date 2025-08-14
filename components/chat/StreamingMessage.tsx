import React, { useEffect, useState, useRef } from 'react';

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
  speed?: number; // 每个字符的显示间隔（毫秒）
  onComplete?: () => void;
}

export default function StreamingMessage({ 
  content, 
  isStreaming = false,
  speed = 20,
  onComplete 
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef('');

  useEffect(() => {
    // 如果内容变化，检查是否是增量更新
    if (content !== lastContentRef.current) {
      if (isStreaming) {
        // 流式模式下，直接显示所有内容
        setDisplayedContent(content);
        setCurrentIndex(content.length);
      } else {
        // 非流式模式，逐字显示
        if (content.startsWith(lastContentRef.current)) {
          // 增量更新，只处理新增部分
          const newContent = content.slice(lastContentRef.current.length);
          if (newContent) {
            animateText(lastContentRef.current, content);
          }
        } else {
          // 完全新的内容，重新开始
          setDisplayedContent('');
          setCurrentIndex(0);
          animateText('', content);
        }
      }
      lastContentRef.current = content;
    }
  }, [content, isStreaming]);

  const animateText = (startContent: string, fullContent: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let index = startContent.length;
    setDisplayedContent(startContent);
    setCurrentIndex(index);

    if (!isStreaming && index < fullContent.length) {
      intervalRef.current = setInterval(() => {
        if (index < fullContent.length) {
          // 批量添加字符以提高性能
          const batchSize = Math.min(3, fullContent.length - index);
          const nextContent = fullContent.slice(0, index + batchSize);
          setDisplayedContent(nextContent);
          index += batchSize;
          setCurrentIndex(index);
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.();
        }
      }, speed);
    } else if (index >= fullContent.length) {
      onComplete?.();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 处理Markdown格式的简单渲染
  const renderContent = (text: string) => {
    // 基础的Markdown处理
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // 处理代码块
      if (line.startsWith('```')) {
        return (
          <div key={index} className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded my-2">
            <code>{line.replace(/```/g, '')}</code>
          </div>
        );
      }
      
      // 处理标题
      if (line.startsWith('### ')) {
        return <h3 key={index} className="font-bold text-lg mt-3 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="font-bold text-xl mt-3 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="font-bold text-2xl mt-3 mb-2">{line.slice(2)}</h1>;
      }
      
      // 处理列表
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.slice(2)}
          </li>
        );
      }
      
      // 处理数字列表
      const numberListMatch = line.match(/^(\d+)\.\s(.+)/);
      if (numberListMatch) {
        return (
          <li key={index} className="ml-4 list-decimal">
            {numberListMatch[2]}
          </li>
        );
      }
      
      // 处理加粗文本
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/__(.*?)__/g, '<strong>$1</strong>');
      
      // 处理斜体文本
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      processedLine = processedLine.replace(/_(.*?)_/g, '<em>$1</em>');
      
      // 处理行内代码
      processedLine = processedLine.replace(
        /`([^`]+)`/g,
        '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">$1</code>'
      );
      
      // 普通段落
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      return (
        <span 
          key={index} 
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  return (
    <div className="whitespace-pre-wrap">
      {renderContent(displayedContent)}
      {isStreaming && currentIndex < content.length && (
        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
      )}
    </div>
  );
}