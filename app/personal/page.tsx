'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import ProfileCard from '@/components/personal/ProfileCard';
import PersonalInfo from '@/components/personal/PersonalInfo';
import ActionButtons from '@/components/personal/ActionButtons';
import TrainingSection from '@/components/personal/TrainingSection';

interface TrainingItem {
  id: string;
  name: string;
  type: string;
  dataCount: number;
  status: 'completed' | 'training' | 'failed';
  icon: string;
  date: string;
}

export default function PersonalCentre() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    digitalHumans: 0,
    conversations: 0,
    trainingSessions: 0
  });
  const [trainingData, setTrainingData] = useState<TrainingItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 这里将来可以从API获取用户的实际数据
  // 目前先显示空状态或者可以根据需要添加一些示例数据进行测试
  useEffect(() => {
    if (user) {
      // 示例：如果需要测试有数据的状态，可以取消注释下面的代码
      // setUserStats({
      //   digitalHumans: 12,
      //   conversations: 48,
      //   trainingSessions: 156
      // });
      // setTrainingData([
      //   {
      //     id: '1',
      //     name: '口才训练助手 - 演讲技巧优化',
      //     type: '对话训练',
      //     dataCount: 5000,
      //     status: 'completed',
      //     icon: '🎯',
      //     date: '2天前'
      //   },
      //   // 更多数据...
      // ]);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-[#F5F5F5]">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A1628] relative overflow-x-hidden">
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <Navbar />
      
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <ProfileCard 
              user={user} 
              digitalHumans={userStats.digitalHumans}
              conversations={userStats.conversations}
              trainingSessions={userStats.trainingSessions}
            />
          </div>
          <div className="lg:col-span-2">
            <PersonalInfo user={user} />
          </div>
        </div>

        <ActionButtons />
        
        <TrainingSection trainingData={trainingData} />
      </div>
    </div>
  );
}