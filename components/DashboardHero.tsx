'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DashboardHeroProps {
  userName: string;
  onQuickLogMood: () => void;
  onQuickLogSymptom: () => void;
  onQuickLogPeriod: () => void;
}

interface CycleData {
  cycleDay: number;
  daysUntilPeriod: number;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  predictedPeriodDate: string | null;
  predictedOvulation: string | null;
  daysUntilOvulation: number | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  inFertileWindow: boolean;
  averageCycleLength: number | null;
  regularityPercentage: number | null;
  totalCycles: number;
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
    tip: 'Rest and be gentle with yourself',
    description: 'Days 1-5 of your cycle. Your uterine lining sheds during this time. Energy and mood may be lower. Focus on rest, gentle movement, and comfort foods rich in iron.'
  },
  follicular: {
    name: 'Follicular',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '🌱',
    tip: 'Energy is rising - great for new projects',
    description: 'Days 6-13. Estrogen rises as your body prepares an egg. You may feel more energetic, creative, and social. Great time for starting new projects or challenging workouts.'
  },
  ovulation: {
    name: 'Ovulation',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '🌕',
    tip: 'Peak energy and social time',
    description: 'Days 14-16. An egg is released. Estrogen peaks, often bringing highest energy, confidence, and communication skills. This is your fertile window if trying to conceive.'
  },
  luteal: {
    name: 'Luteal',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🍂',
    tip: 'Winding down - prioritize self-care',
    description: 'Days 17-28. Progesterone rises then falls. You may experience PMS symptoms like bloating, mood changes, or cravings. Focus on self-care, adequate sleep, and stress management.'
  }
};

export default function DashboardHero({ userName, onQuickLogMood, onQuickLogSymptom, onQuickLogPeriod }: DashboardHeroProps) {
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getDaysUntil = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const loadDashboardData = async () => {
    try {
      // Fetch cycle stats
      const cycleRes = await api.get('/cycles/stats');
      const cycleStats = cycleRes.data.stats || cycleRes.data;
      
      // Calculate cycle data using the stats from API
      if (cycleStats.lastPeriodStart || cycleStats.predictedNextPeriod) {
        const lastPeriodDate = cycleStats.lastPeriodStart ? new Date(cycleStats.lastPeriodStart) : null;
        const today = new Date();
        
        let cycleDay = 0;
        let daysUntilPeriod = 0;
        let phase: CycleData['phase'] = 'luteal';
        let predictedPeriodDate: string | null = null;
        
        if (lastPeriodDate) {
          const daysSinceStart = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
          cycleDay = daysSinceStart + 1;
          const avgCycleLength = cycleStats.averageCycleLength || 28;
          daysUntilPeriod = Math.max(0, avgCycleLength - daysSinceStart);
          
          // Determine phase
          if (cycleDay <= 5) phase = 'menstrual';
          else if (cycleDay <= 13) phase = 'follicular';
          else if (cycleDay <= 16) phase = 'ovulation';
          
          // Calculate predicted period date
          const predictedDate = new Date(lastPeriodDate);
          predictedDate.setDate(predictedDate.getDate() + avgCycleLength);
          predictedPeriodDate = predictedDate.toISOString();
        }
        
        // Use API predictions if available (more accurate)
        if (cycleStats.predictedNextPeriod) {
          predictedPeriodDate = cycleStats.predictedNextPeriod;
          daysUntilPeriod = getDaysUntil(cycleStats.predictedNextPeriod);
        }
        
        // Calculate ovulation info
        let daysUntilOvulation: number | null = null;
        let inFertileWindow = false;
        
        if (cycleStats.predictedOvulation) {
          daysUntilOvulation = getDaysUntil(cycleStats.predictedOvulation);
        }
        
        if (cycleStats.fertileWindowStart && cycleStats.fertileWindowEnd) {
          const daysToFertileStart = getDaysUntil(cycleStats.fertileWindowStart);
          const daysToFertileEnd = getDaysUntil(cycleStats.fertileWindowEnd);
          inFertileWindow = daysToFertileStart <= 0 && daysToFertileEnd >= 0;
        }
        
        setCycleData({
          cycleDay,
          daysUntilPeriod,
          phase,
          predictedPeriodDate,
          predictedOvulation: cycleStats.predictedOvulation || null,
          daysUntilOvulation,
          fertileWindowStart: cycleStats.fertileWindowStart || null,
          fertileWindowEnd: cycleStats.fertileWindowEnd || null,
          inFertileWindow,
          averageCycleLength: cycleStats.averageCycleLength || null,
          regularityPercentage: cycleStats.regularityPercentage || null,
          totalCycles: cycleStats.totalCycles || 0
        });
      } else {
        setCycleData({
          cycleDay: 0,
          daysUntilPeriod: 0,
          phase: 'luteal',
          predictedPeriodDate: null,
          predictedOvulation: null,
          daysUntilOvulation: null,
          fertileWindowStart: null,
          fertileWindowEnd: null,
          inFertileWindow: false,
          averageCycleLength: null,
          regularityPercentage: null,
          totalCycles: cycleStats.totalCycles || 0
        });
      }

      // Fetch streak data
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      const [moodRes, symptomRes] = await Promise.all([
        api.get('/mood?limit=30'),
        api.get('/symptom?limit=30')
      ]);
      
      const moodEntries = moodRes.data.moodEntries || [];
      const symptoms = symptomRes.data.symptoms || [];
      
      // Check if logged today
      const moodLoggedToday = moodEntries.some((m: any) => {
        const entryDate = new Date(m.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === todayDate.getTime();
      });
      
      const symptomLoggedToday = symptoms.some((s: any) => {
        const entryDate = new Date(s.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === todayDate.getTime();
      });
      
      // Fetch streak data from personal records API for consistency
      let currentStreak = 0;
      try {
        const recordsRes = await api.get('/analytics/personal-records');
        if (recordsRes.data.unlocked && recordsRes.data.stats) {
          currentStreak = recordsRes.data.stats.currentStreak || 0;
        }
      } catch (err) {
        // Fallback to local calculation if records API fails
        const sortedEntries = moodEntries
          .map((m: any) => {
            const d = new Date(m.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          })
          .sort((a: number, b: number) => b - a);
        
        const checkDate = new Date(todayDate);
        while (true) {
          checkDate.setHours(0, 0, 0, 0);
          if (sortedEntries.includes(checkDate.getTime())) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      
      setStreakData({
        currentStreak,
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

  const phaseConfig = cycleData && cycleData.totalCycles >= 1 ? PHASE_CONFIG[cycleData.phase] : null;
  const hasSufficientData = cycleData && cycleData.totalCycles >= 2;

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {/* Period Countdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-xs uppercase tracking-wide mb-1">Next Period</p>
          {hasSufficientData && cycleData.predictedPeriodDate ? (
            <>
              <p className="text-2xl sm:text-3xl font-bold">
                {cycleData.daysUntilPeriod <= 0 ? (
                  <span className="text-yellow-300">Due!</span>
                ) : (
                  `${cycleData.daysUntilPeriod}d`
                )}
              </p>
              <p className="text-xs text-pink-100 mt-1">
                {cycleData.daysUntilPeriod <= 0 
                  ? 'Expected now' 
                  : formatPredictedDate(cycleData.predictedPeriodDate)}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">--</p>
              <p className="text-xs text-pink-100">Need 2+ cycles</p>
            </>
          )}
        </div>

        {/* Cycle Day */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-xs uppercase tracking-wide mb-1">Cycle Day</p>
          {cycleData && cycleData.totalCycles >= 1 ? (
            <p className="text-2xl sm:text-3xl font-bold">Day {cycleData.cycleDay}</p>
          ) : (
            <p className="text-lg">--</p>
          )}
        </div>

        {/* Cycle Phase */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors relative group z-10">
          <p className="text-pink-100 text-xs uppercase tracking-wide mb-1">Phase</p>
          {phaseConfig ? (
            <>
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-2xl">{phaseConfig.icon}</span>
                <p className="font-bold">{phaseConfig.name}</p>
                <span className="text-pink-200 text-xs">ⓘ</span>
              </div>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto w-72">
                <div className="bg-gray-900 text-white text-sm rounded-lg p-4 shadow-2xl border border-gray-700">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span>{phaseConfig.icon}</span> {phaseConfig.name} Phase
                  </p>
                  <p className="text-gray-300 text-xs leading-relaxed">{phaseConfig.description}</p>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-lg">--</p>
          )}
        </div>

        {/* Ovulation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
          <p className="text-pink-100 text-xs uppercase tracking-wide mb-1">Ovulation</p>
          {hasSufficientData && cycleData.daysUntilOvulation !== null ? (
            <>
              <p className="text-2xl sm:text-3xl font-bold">
                {cycleData.daysUntilOvulation < 0 ? (
                  <>
                    <span className="text-teal-300">~{(cycleData.averageCycleLength || 28) + cycleData.daysUntilOvulation}d</span>
                  </>
                ) : cycleData.daysUntilOvulation === 0 ? (
                  <span className="text-teal-300">Today</span>
                ) : (
                  `${cycleData.daysUntilOvulation}d`
                )}
              </p>
              {cycleData.predictedOvulation && cycleData.daysUntilOvulation >= 0 && (
                <p className="text-xs text-pink-100">
                  {formatPredictedDate(cycleData.predictedOvulation)}
                </p>
              )}
              {cycleData.daysUntilOvulation < 0 && (
                <p className="text-xs text-pink-100">
                  Next cycle est.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-lg font-medium">--</p>
              <p className="text-xs text-pink-100">Need 2+ cycles</p>
            </>
          )}
        </div>

        {/* Today's Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors col-span-2 sm:col-span-1">
          <p className="text-pink-100 text-xs uppercase tracking-wide mb-1">Today</p>
          <div className="flex items-center gap-2 flex-wrap">
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
              <span className="text-pink-100 text-sm">Nothing logged yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Fertile Window Indicator */}
      {cycleData?.inFertileWindow && (
        <div className="bg-teal-500/30 border border-teal-400/50 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium">🌸 Fertile window active</span>
          {cycleData.fertileWindowStart && cycleData.fertileWindowEnd && (
            <span className="text-sm text-teal-100 ml-2">
              ({formatPredictedDate(cycleData.fertileWindowStart)} - {formatPredictedDate(cycleData.fertileWindowEnd)})
            </span>
          )}
        </div>
      )}

      {/* Phase Tip */}
      {phaseConfig && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 mb-6">
          <p className="text-sm">
            <span className="font-medium">💡 {phaseConfig.name} phase tip:</span>{' '}
            <span className="text-pink-100">{phaseConfig.tip}</span>
          </p>
        </div>
      )}

      {/* Cycle Stats Footer */}
      {hasSufficientData && (
        <div className="flex items-center justify-between text-sm text-white/70 mb-4 px-1">
          <span>Avg cycle: {cycleData.averageCycleLength} days</span>
          <span>{cycleData.regularityPercentage}% regular</span>
          <a href="/cycles" className="text-white hover:text-pink-200 transition">
            View Details →
          </a>
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
        
        <button
          onClick={onQuickLogPeriod}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          <span className="text-xl">📅</span>
          Log Period
        </button>
      </div>
    </div>
  );
}
