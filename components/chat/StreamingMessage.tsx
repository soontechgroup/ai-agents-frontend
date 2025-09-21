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
  const lastContentRef = useRef('');

  useEffect(() => {
    // 如果内容变化，检查是否是增量更新
    if (content !== lastContentRef.current) {
      if (isStreaming) {
        // 流式模式下，直接显示所有内容（纯文本，不做格式化）
        setDisplayedContent(content);
      } else {
        // 非流式模式，直接显示完整内容
        setDisplayedContent(content);
        onComplete?.();
      }
      lastContentRef.current = content;
    }
  }, [content, isStreaming, onComplete]);

  // 简化的渲染函数 - 流式时只显示纯文本，完成后显示格式化内容
  const renderContent = () => {
    if (isStreaming) {
      // 流式传输时，只显示纯文本，避免复杂的DOM操作
      return (
        <>
          <span className="whitespace-pre-wrap">{displayedContent}</span>
          <span className="inline-block w-2 h-4 bg-current opacity-50 animate-pulse ml-0.5 align-middle" />
        </>
      );
    }

    // 非流式状态，进行完整的Markdown渲染
    const lines = displayedContent.split('\n');

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

      // 处理加粗和斜体文本
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/__(.*?)__/g, '<strong>$1</strong>');
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
    <div className="relative min-h-[1.5rem]">
      {renderContent()}
    </div>
  );
}