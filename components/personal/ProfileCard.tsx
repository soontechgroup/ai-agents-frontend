'use client';

import { User } from '@/lib/types';
import StatsGrid from './StatsGrid';

interface ProfileCardProps {
  user: User;
  digitalHumans?: number;
  conversations?: number;
  trainingSessions?: number;
  onTabChange?: (tab: 'digital-humans' | 'training' | 'conversations') => void;
}

export default function ProfileCard({ user, digitalHumans = 0, conversations = 0, trainingSessions = 0, onTabChange }: ProfileCardProps) {
  const getUserInitials = (user: User) => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(name => name[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#16213E] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 backdrop-blur-xl shadow-[0_10px_15px_rgba(0,217,255,0.15)] relative overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_20px_25px_rgba(0,217,255,0.2),0_0_10px_rgba(0,217,255,0.3)] hover:border-[rgba(255,255,255,0.2)]">
      <div 
        className="absolute inset-[-2px] rounded-2xl p-[2px] opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#7B68EE] border-3 border-[#00D9FF] flex items-center justify-center text-3xl font-semibold text-[#0A1628] relative overflow-hidden shadow-[0_0_20px_rgba(0,217,255,0.4)]">
            <span>{getUserInitials(user)}</span>
            <div 
              className="absolute inset-[-50%] opacity-30 animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, transparent, #00D9FF, transparent 30%)',
                animationDuration: '3s'
              }}
            />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-[#F5F5F5] mb-2">
          {user.full_name || user.username}
        </h2>
        <p className="text-[#6C7293] text-sm mb-4">
          ID: {user.id}
        </p>
      </div>

      <StatsGrid 
        digitalHumans={digitalHumans}
        conversations={conversations}
        trainingSessions={trainingSessions}
        onTabChange={onTabChange}
      />
    </div>
  );
}