'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatTopbar from '@/components/chat/ChatTopbar';
import ChatDialogue from '@/components/chat/ChatDialogue';
import ChatInput from '@/components/chat/ChatInput';
import { DigitalHuman, ChatMessage } from '@/lib/types/digital-human';
import { useToast } from '@/lib/hooks/useToast';

export default function DigitalHumanChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast, ToastContainer } = useToast();

  // 状态管理
  const [digitalHuman, setDigitalHuman] = useState<DigitalHuman | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(1); // 包含欢迎消息

  // 初始化数字人信息和欢迎消息
  useEffect(() => {
    // 模拟获取数字人信息
    setDigitalHuman({
      id,
      name: '口才训练助手',
      description: '帮你提升表达和沟通能力',
      avatar: '🎤',
      status: 'online',
      chats: 948,
      rating: 4.8,
      specialties: ['演讲', '沟通'],
      topics: [
        '如何克服演讲紧张？',
        '怎样让表达更有逻辑？',
        '如何提升语言感染力？',
        '职场沟通有哪些技巧？'
      ]
    });

    // 添加欢迎消息
    setMessages([{
      id: '1',
      type: 'ai',
      content: '嗨，你好。\n\n你好呀！很高兴和你通话，开启这次口才训练之旅。为了能给你制定更有针对性的训练方案，能否先简单跟我讲讲你的工作领域以及日常沟通场景呢？比如是职场汇报比较多，还是日常社交沟通居多，这样我能更好地帮你提升口才。',
      timestamp: new Date()
    }]);
  }, [id]);

  // 发送消息
  const sendMessage = async (content: string, isVoice: boolean = false) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    setIsThinking(true);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponses = [
        '这是个很好的问题！让我来帮你解答...',
        '我理解你的意思。根据我的经验...',
        '谢谢你的分享！关于这个话题...',
        '很有意思的观点！让我们深入探讨一下...'
      ];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setMessageCount(prev => prev + 1);
      setIsThinking(false);
    }, 1500);
  };

  // 使用推荐话题
  const useTopic = (topic: string) => {
    sendMessage(topic);
  };

  // 切换收藏状态
  const toggleFavorite = () => {
    showToast({
      message: '收藏功能暂未开放，敬请期待',
      type: 'info'
    });
  };

  // 分享功能
  const shareChat = () => {
    showToast({
      message: '分享功能暂未开放，敬请期待',
      type: 'info'
    });
  };

  if (!digitalHuman) {
    return <div>加载中...</div>;
  }

  return (
    <div className="flex h-screen relative">
      {/* 网格背景 */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 侧边栏 */}
      <ChatSidebar 
        digitalHuman={digitalHuman}
        onUseTopic={useTopic}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* 顶部栏 */}
        <ChatTopbar
          digitalHuman={digitalHuman}
          sessionStartTime={sessionStartTime}
          messageCount={messageCount}
          isFavorited={isFavorited}
          onBack={() => router.back()}
          onToggleFavorite={toggleFavorite}
          onShare={shareChat}
        />

        {/* 对话区域 */}
        <ChatDialogue
          messages={messages}
          isThinking={isThinking}
        />

        {/* 输入区域 */}
        <ChatInput
          onSendMessage={sendMessage}
        />
      </main>

      {/* Toast容器 */}
      <ToastContainer />
    </div>
  );
}