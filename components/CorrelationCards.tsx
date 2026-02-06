'use client';

import { useEffect, useState } from 'react';
import { analytics, type RankedPhase, type CorrelationInsight } from '@/lib/api';

const RANK_BADGES = ['🥇', '🥈', '🥉', '4️⃣'];

export default function CorrelationCards() {
  const [rankedPhases, setRankedPhases] = useState<RankedPhase[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationInsight[]>([]);
  const [overallAvg, setOverallAvg] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockInfo, setUnlockInfo] = useState<{ cyclesNeeded: number; currentCycles: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await analytics.getCorrelations();
      
      if (result.unlocked) {
        setUnlocked(true);
        setRankedPhases(result.rankedPhases || []);
        setCorrelations(result.correlations || []);
        setOverallAvg(result.overallMoodAverage);
      } else {
        setUnlocked(false);
        setUnlockInfo({
          cyclesNeeded: result.cyclesNeeded,
          currentCycles: result.currentCycles
        });
      }
    } catch (error) {
      console.error('Error loading correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Locked state
  if (!unlocked && unlockInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-xl">🔗</span> Cycle Insights
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              Locked
            </span>
          </h3>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-3xl">📅</span>
          </div>
          
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Log your first period to unlock
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Discover how your mood changes across your cycle phases
          </p>
          
          <a
            href="/cycles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
          >
            <span>📅</span> Log Period
          </a>
        </div>
      </div>
    );
  }

  // Not enough data yet
  if (rankedPhases.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-xl">🔗</span> Cycle Insights
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Building your patterns...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Keep tracking mood during your cycle. Insights will appear as we detect patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🔗</span> Your Mood by Phase
        </h3>
        {overallAvg && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            Overall avg: {overallAvg}/5
          </span>
        )}
      </div>

      {/* Ranked Phases */}
      <div className="space-y-3 mb-5">
        {rankedPhases.map((phase, index) => (
          <div 
            key={phase.phase}
            className={`p-4 rounded-lg border-2 transition ${
              index === 0 
                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20' 
                : index === rankedPhases.length - 1
                ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20'
                : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Rank & Icon */}
              <div className="flex-shrink-0 text-center">
                <span className="text-2xl">{RANK_BADGES[index] || '•'}</span>
                <span className="text-xl block mt-1">{phase.icon}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{phase.label}</p>
                  <span className={`text-sm font-bold ${
                    phase.vsOverall > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : phase.vsOverall < 0 
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-500'
                  }`}>
                    {phase.avgMood.toFixed(1)}/5
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {phase.description}
                </p>
                
                {/* Actionable tip */}
                <div className="flex items-start gap-2 bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-100 dark:border-gray-600">
                  <span className="text-yellow-500 flex-shrink-0">💡</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{phase.tip}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Symptom Correlations */}
      {correlations.length > 0 && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Symptom patterns detected:
            </p>
            <div className="space-y-2">
              {correlations.slice(0, 3).map((c, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-purple-500">•</span>
                  <span>{c.finding}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
        Based on your tracked data. Keep logging for better insights.
      </p>
    </div>
  );
}
