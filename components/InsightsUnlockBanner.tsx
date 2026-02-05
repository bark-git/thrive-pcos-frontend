'use client';

import { useEffect, useState } from 'react';
import { analytics } from '@/lib/api';

interface UnlockStatus {
  unlocked: boolean;
  current: number;
  threshold: number;
  remaining: number;
  label: string;
}

export default function InsightsUnlockBanner() {
  const [nextMilestone, setNextMilestone] = useState<{
    feature: string;
    remaining: number;
    type: string;
  } | null>(null);
  const [allUnlocked, setAllUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const result = await analytics.getInsights();
      setAllUnlocked(result.allUnlocked);
      setNextMilestone(result.nextMilestone);
    } catch (error) {
      console.error('Error loading insights status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || allUnlocked || !nextMilestone) {
    return null;
  }

  const getActionLink = (type: string) => {
    switch (type) {
      case 'moodTrends':
        return { href: '#', action: 'Log Mood', icon: '😊' };
      case 'correlations':
        return { href: '/cycles', action: 'Log Period', icon: '📅' };
      case 'symptomPatterns':
        return { href: '#', action: 'Log Symptom', icon: '📋' };
      default:
        return { href: '/dashboard', action: 'Keep Tracking', icon: '✨' };
    }
  };

  const action = getActionLink(nextMilestone.type);

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 mb-6 shadow-lg shadow-purple-500/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <p className="text-white font-medium">
              {nextMilestone.remaining === 1 
                ? `Just 1 more to unlock ${nextMilestone.feature}!`
                : `${nextMilestone.remaining} more to unlock ${nextMilestone.feature}`
              }
            </p>
            <p className="text-white/70 text-sm">
              {nextMilestone.type === 'correlations' 
                ? 'Log your period to start seeing cycle patterns'
                : 'Keep tracking to discover personalized insights'
              }
            </p>
          </div>
        </div>
        
        <a
          href={action.href}
          className="flex-shrink-0 flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-50 transition shadow-md"
        >
          <span>{action.icon}</span>
          {action.action}
        </a>
      </div>
    </div>
  );
}
