'use client';

import { useEffect, useState } from 'react';
import { analytics, type MoodTrendData } from '@/lib/api';

interface MoodTrendChartProps {
  onUnlockProgress?: (current: number, threshold: number) => void;
}

const PHASE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  MENSTRUAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Menstrual' },
  FOLLICULAR: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Follicular' },
  OVULATION: { bg: 'bg-peach-100 dark:bg-peach-900/30', text: 'text-peach-600 dark:text-peach-400', label: 'Ovulation' },
  LUTEAL: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Luteal' },
};

export default function MoodTrendChart({ onUnlockProgress }: MoodTrendChartProps) {
  const [data, setData] = useState<MoodTrendData[]>([]);
  const [stats, setStats] = useState<{
    average: number;
    trend: 'improving' | 'stable' | 'declining';
    trendChange: number;
    highest: number;
    lowest: number;
  } | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockInfo, setUnlockInfo] = useState<{ current: number; threshold: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCycleData, setHasCycleData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await analytics.getMoodTrends(14);
      
      if (result.unlocked) {
        setUnlocked(true);
        setData(result.data);
        setStats(result.stats);
        setHasCycleData(result.cycleContext?.hasCycleData || false);
      } else {
        setUnlocked(false);
        setUnlockInfo({
          current: result.currentCount,
          threshold: result.threshold,
          remaining: result.daysUntilUnlock
        });
        onUnlockProgress?.(result.currentCount, result.threshold);
      }
    } catch (error) {
      console.error('Error loading mood trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
          <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Locked state - show progress
  if (!unlocked && unlockInfo) {
    const progress = (unlockInfo.current / unlockInfo.threshold) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-xl">📈</span> Mood Insights
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              Locked
            </span>
          </h3>
        </div>
        
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-3xl">🔒</span>
          </div>
          
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Track {unlockInfo.remaining} more days to unlock
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            See your mood patterns and how they relate to your cycle phases
          </p>
          
          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{unlockInfo.current} days logged</span>
              <span>{unlockInfo.threshold} needed</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sage-500 to-peach-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked - show chart
  const maxMood = 5;
  const chartHeight = 160;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">📈</span> Mood Trends
        </h3>
        
        {stats && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.average.toFixed(1)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">14-day avg</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.trend === 'improving' 
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : stats.trend === 'declining'
                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {stats.trend === 'improving' && '↑ '}
              {stats.trend === 'declining' && '↓ '}
              {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400">
          <span>5</span>
          <span>3</span>
          <span>1</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full">
          {/* Grid lines */}
          <div className="absolute inset-0 ml-10 mr-0">
            {[1, 2, 3, 4, 5].map((val) => (
              <div
                key={val}
                className="absolute w-full border-t border-gray-100 dark:border-gray-700"
                style={{ bottom: ((val - 1) / (maxMood - 1)) * chartHeight + 32 }}
              />
            ))}
          </div>

          {/* Average line */}
          {stats && (
            <div
              className="absolute w-full border-t-2 border-dashed border-sage-300 dark:border-sage-600 z-10"
              style={{ bottom: ((stats.average - 1) / (maxMood - 1)) * chartHeight + 32 }}
            >
              <span className="absolute right-0 -top-3 text-xs text-sage-500 dark:text-sage-400 bg-white dark:bg-gray-800 px-1">
                avg
              </span>
            </div>
          )}

          {/* Data points and line */}
          <svg className="absolute inset-0 ml-0" style={{ height: chartHeight + 40 }}>
            {/* Line connecting points */}
            <polyline
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = chartHeight - ((d.moodScore - 1) / (maxMood - 1)) * chartHeight;
                return `${x}%,${y}`;
              }).join(' ')}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Data points with phase indicators */}
          <div className="relative h-full">
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = chartHeight - ((d.moodScore - 1) / (maxMood - 1)) * chartHeight;
              const phase = d.cyclePhase ? PHASE_COLORS[d.cyclePhase] : null;
              
              return (
                <div
                  key={i}
                  className="absolute transform -translate-x-1/2 group"
                  style={{ left: `${x}%`, top: y }}
                >
                  {/* Point */}
                  <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 shadow-sm cursor-pointer transition-transform hover:scale-150 ${
                    phase ? phase.bg : 'bg-sage-500'
                  }`} />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <p className="font-medium">Mood: {d.moodScore}/5</p>
                      <p className="text-gray-300">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      {phase && (
                        <p className={phase.text}>{phase.label} (Day {d.cycleDay})</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 pt-2">
            {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map((d, i) => (
              <span key={i}>
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Legend */}
      {hasCycleData && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cycle phases:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(PHASE_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${val.bg}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight summary */}
      {stats && Math.abs(stats.trendChange) >= 0.3 && (
        <div className={`mt-4 p-3 rounded-lg ${
          stats.trend === 'improving'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800'
        }`}>
          <p className={`text-sm ${
            stats.trend === 'improving' ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
          }`}>
            {stats.trend === 'improving' 
              ? `📈 Your mood has improved by ${Math.abs(stats.trendChange).toFixed(1)} points over the past week`
              : `📉 Your mood has dipped ${Math.abs(stats.trendChange).toFixed(1)} points recently. Be gentle with yourself.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
