'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CycleStats {
  totalCycles: number;
  averageCycleLength?: number;
  averagePeriodLength?: number | null;
  regularityPercentage?: number;
  predictedNextPeriod?: string;
  predictedOvulation?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  message?: string;
}

export default function CycleStatusCard() {
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/cycles/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error loading cycle stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
          <div className="h-10 bg-white/20 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalCycles < 2) {
    return (
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Cycle Tracking</h3>
        <p className="text-white/80 text-sm mb-4">
          {stats?.totalCycles === 0 
            ? "Start tracking your cycles to see predictions"
            : "Log at least 2 cycles to see predictions"}
        </p>
        <a 
          href="/cycles" 
          className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium"
        >
          Go to Cycles →
        </a>
      </div>
    );
  }

  const daysUntilPeriod = stats.predictedNextPeriod ? getDaysUntil(stats.predictedNextPeriod) : null;
  const daysUntilOvulation = stats.predictedOvulation ? getDaysUntil(stats.predictedOvulation) : null;
  const inFertileWindow = stats.fertileWindowStart && stats.fertileWindowEnd
    ? getDaysUntil(stats.fertileWindowStart) <= 0 && getDaysUntil(stats.fertileWindowEnd) >= 0
    : false;

  return (
    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cycle Status</h3>
        <a 
          href="/cycles" 
          className="text-white/80 hover:text-white text-sm transition"
        >
          View Details →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Next Period */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-white/70 text-xs uppercase tracking-wide mb-1">Next Period</div>
          {daysUntilPeriod !== null && (
            <>
              <div className="text-3xl font-bold">
                {daysUntilPeriod <= 0 ? (
                  <span className="text-yellow-300">Due</span>
                ) : (
                  `${daysUntilPeriod}d`
                )}
              </div>
              <div className="text-white/70 text-sm">
                {daysUntilPeriod <= 0 ? 'Expected now' : formatDate(stats.predictedNextPeriod!)}
              </div>
            </>
          )}
        </div>

        {/* Ovulation */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-white/70 text-xs uppercase tracking-wide mb-1">Ovulation</div>
          {daysUntilOvulation !== null && (
            <>
              <div className="text-3xl font-bold">
                {daysUntilOvulation < 0 ? (
                  <span className="text-white/50">Passed</span>
                ) : daysUntilOvulation === 0 ? (
                  <span className="text-teal-300">Today</span>
                ) : (
                  `${daysUntilOvulation}d`
                )}
              </div>
              <div className="text-white/70 text-sm">
                {daysUntilOvulation < 0 
                  ? 'This cycle' 
                  : daysUntilOvulation === 0 
                    ? 'Predicted today'
                    : formatDate(stats.predictedOvulation!)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fertile Window Indicator */}
      {inFertileWindow && (
        <div className="mt-4 bg-teal-500/30 border border-teal-400/50 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium">Fertile window active</span>
        </div>
      )}

      {/* Cycle Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-white/70">
        <span>Avg cycle: {stats.averageCycleLength} days</span>
        <span>{stats.regularityPercentage}% regular</span>
      </div>
    </div>
  );
}
