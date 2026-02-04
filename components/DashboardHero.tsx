'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DashboardHeroProps {
  userName: string;
  onQuickLogMood: () => void;
  onQuickLogSymptom: () => void;
}

interface CycleData {
  cycleDay: number;
  daysUntilPeriod: number;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  predictedPeriodDate: string | null;
}

interface StreakData {
  currentStreak: number;
  loggedToday: boolean;
  moodLoggedToday: boolean;
  symptomLoggedToday: boolean;
}

const PHASE_CONFIG = {
  menstrual: {
    name: 'Menstrual',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '🩸',
    tip: 'Rest and be gentle with yourself'
  },
  follicular: {
    name: 'Follicular',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '🌱',
    tip: 'Energy is rising - great for new projects'
  },
  ovulation: {
    name: 'Ovulation',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🌕',
    tip: 'Peak energy and social time'
  },
  luteal: {
    name: 'Luteal',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🍂',
    tip: 'Winding down - prioritize self-care'
  }
};

export default function DashboardHero({ userName, onQuickLogMood, onQuickLogSymptom }: DashboardHeroProps) {
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch cycle stats
      const cycleRes = await api.get('/cycles/stats');
      const cycleStats = cycleRes.data;
      
      // Calculate cycle data
      if (cycleStats.lastPeriodStart) {
        const lastPeriodDate = new Date(cycleStats.lastPeriodStart);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
        const cycleDay = daysSinceStart + 1;
        const avgCycleLength = cycleStats.averageCycleLength || 28;
        const daysUntilPeriod = Math.max(0, avgCycleLength - daysSinceStart);
        
        // Determine phase
        let phase: CycleData['phase'] = 'luteal';
        if (cycleDay <= 5) phase = 'menstrual';
        else if (cycleDay <= 13) phase = 'follicular';
        else if (cycleDay <= 16) phase = 'ovulation';
        
        // Calculate predicted period date
        const predictedDate = new Date(lastPeriodDate);
        predictedDate.setDate(predictedDate.getDate() + avgCycleLength);
        
        setCycleData({
          cycleDay,
          daysUntilPeriod,
          phase,
          predictedPeriodDate: predictedDate.toISOString()
        });
      }

      // Fetch streak data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [moodRes, symptomRes] = await Promise.all([
        api.get('/mood?limit=30'),
        api.get('/symptom?limit=30')
      ]);
      
      const moodEntries = moodRes.data.entries || [];
      const symptoms = symptomRes.data.symptoms || [];
      
      // Check if logged today
      const moodLoggedToday = moodEntries.some((m: any) => {
        const entryDate = new Date(m.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      
      const symptomLoggedToday = symptoms.some((s: any) => {
        const entryDate = new Date(s.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      
      // Calculate streak from mood entries
      let streak = 0;
      const checkDate = new Date(today);
      
      // If logged today, start counting from today
      if (moodLoggedToday) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      // Check consecutive previous days
      const sortedEntries = moodEntries
        .map((m: any) => {
          const d = new Date(m.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
        .sort((a: number, b: number) => b - a);
      
      for (const entryTime of sortedEntries) {
        checkDate.setHours(0, 0, 0, 0);
        if (entryTime === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (entryTime < checkDate.getTime()) {
          break;
        }
      }
      
      setStreakData({
        currentStreak: streak,
        loggedToday: moodLoggedToday || symptomLoggedToday,
        moodLoggedToday,
        symptomLoggedToday
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatPredictedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-48 mb-4"></div>
          <div className="h-4 bg-white/20 rounded w-64"></div>
        </div>
      </div>
    );
  }

  const phaseConfig = cycleData ? PHASE_CONFIG[cycleData.phase] : null;

  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-xl shadow-pink-500/20">
      {/* Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-pink-100">
            {streakData?.loggedToday 
              ? "You've already logged today. Great job!" 
              : "Ready to check in with your body?"}
          </p>
        </div>
        
        {/* Streak Badge */}
        {streakData && streakData.currentStreak > 0 && (
          <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-2xl animate-pulse">🔥</span>
            <div>
              <p className="font-bold text-lg">{streakData.currentStreak} day streak</p>
              <p className="text-xs text-pink-100">Keep it going!</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Period Countdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-sm mb-1">Period in</p>
          {cycleData ? (
            <>
              <p className="text-3xl font-bold">
                {cycleData.daysUntilPeriod === 0 ? 'Today!' : `${cycleData.daysUntilPeriod} days`}
              </p>
              {cycleData.predictedPeriodDate && (
                <p className="text-xs text-pink-100 mt-1">
                  ~{formatPredictedDate(cycleData.predictedPeriodDate)}
                </p>
              )}
            </>
          ) : (
            <p className="text-lg">Log periods to see</p>
          )}
        </div>

        {/* Cycle Day */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-sm mb-1">Cycle Day</p>
          {cycleData ? (
            <p className="text-3xl font-bold">Day {cycleData.cycleDay}</p>
          ) : (
            <p className="text-lg">--</p>
          )}
        </div>

        {/* Cycle Phase */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-sm mb-1">Phase</p>
          {phaseConfig ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{phaseConfig.icon}</span>
              <div>
                <p className="font-bold">{phaseConfig.name}</p>
              </div>
            </div>
          ) : (
            <p className="text-lg">--</p>
          )}
        </div>

        {/* Today's Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-sm mb-1">Today</p>
          <div className="flex items-center gap-2">
            {streakData?.moodLoggedToday && (
              <span className="bg-green-400/30 text-white text-xs px-2 py-1 rounded-full">
                ✓ Mood
              </span>
            )}
            {streakData?.symptomLoggedToday && (
              <span className="bg-green-400/30 text-white text-xs px-2 py-1 rounded-full">
                ✓ Symptom
              </span>
            )}
            {!streakData?.loggedToday && (
              <span className="text-pink-100">Nothing logged yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Phase Tip */}
      {phaseConfig && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 mb-6">
          <p className="text-sm">
            <span className="font-medium">💡 {phaseConfig.name} phase tip:</span>{' '}
            <span className="text-pink-100">{phaseConfig.tip}</span>
          </p>
        </div>
      )}

      {/* Quick Log Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onQuickLogMood}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            streakData?.moodLoggedToday 
              ? 'bg-white/20 text-white hover:bg-white/25' 
              : 'bg-white text-pink-600 hover:bg-pink-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          <span className="text-xl">😊</span>
          {streakData?.moodLoggedToday ? 'Mood Logged ✓' : 'Log Mood'}
        </button>
        
        <button
          onClick={onQuickLogSymptom}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            streakData?.symptomLoggedToday 
              ? 'bg-white/20 text-white hover:bg-white/25' 
              : 'bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          <span className="text-xl">📋</span>
          {streakData?.symptomLoggedToday ? 'Symptom Logged ✓' : 'Log Symptom'}
        </button>
        
        <a
          href="/cycles"
          className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-200"
        >
          <span className="text-xl">📅</span>
          Log Period
        </a>
      </div>
    </div>
  );
}
