'use client';

import { useEffect, useState } from 'react';
import { analytics, type CorrelationInsight } from '@/lib/api';

const PHASE_INFO: Record<string, { icon: string; color: string }> = {
  MENSTRUAL: { icon: '🩸', color: 'from-red-500 to-red-600' },
  FOLLICULAR: { icon: '🌱', color: 'from-green-500 to-green-600' },
  OVULATION: { icon: '🌕', color: 'from-purple-500 to-purple-600' },
  LUTEAL: { icon: '🍂', color: 'from-amber-500 to-amber-600' },
};

const CONFIDENCE_BADGES: Record<string, { label: string; class: string }> = {
  high: { label: 'Strong pattern', class: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  medium: { label: 'Emerging pattern', class: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  low: { label: 'Early signal', class: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' },
};

export default function CorrelationCards() {
  const [correlations, setCorrelations] = useState<CorrelationInsight[]>([]);
  const [moodByPhase, setMoodByPhase] = useState<Record<string, number | null>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [unlockInfo, setUnlockInfo] = useState<{ cyclesNeeded: number; currentCycles: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{
    moodEntriesAnalyzed: number;
    symptomsAnalyzed: number;
    analysisWindow: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await analytics.getCorrelations();
      
      if (result.unlocked) {
        setUnlocked(true);
        setCorrelations(result.correlations || []);
        setMoodByPhase(result.moodByPhase || {});
        setMetadata(result.metadata);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
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
            <span className="text-xl">🔗</span> Cycle Correlations
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
            Log your first complete cycle to unlock
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Discover how your symptoms and mood change across your cycle phases
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

  // No correlations found yet
  if (correlations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-xl">🔗</span> Cycle Correlations
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Building your patterns...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Keep tracking your mood and symptoms. Insights will appear as we detect patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🔗</span> Cycle Correlations
        </h3>
        {metadata && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Based on {metadata.moodEntriesAnalyzed} entries
          </span>
        )}
      </div>

      {/* Mood by Phase Summary */}
      {Object.values(moodByPhase).some(v => v !== null) && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Average mood by phase:</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(moodByPhase).map(([phase, avg]) => {
              const info = PHASE_INFO[phase];
              return (
                <div
                  key={phase}
                  className={`text-center p-3 rounded-lg ${
                    avg !== null 
                      ? 'bg-gray-50 dark:bg-gray-700' 
                      : 'bg-gray-50/50 dark:bg-gray-700/50 opacity-50'
                  }`}
                >
                  <span className="text-lg">{info?.icon || '📊'}</span>
                  <p className={`text-xl font-bold ${
                    avg !== null ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    {avg !== null ? avg.toFixed(1) : '--'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {phase.toLowerCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Correlation Cards */}
      <div className="space-y-3">
        {correlations.slice(0, 4).map((correlation, index) => {
          const phaseInfo = PHASE_INFO[correlation.phase];
          const confidenceBadge = CONFIDENCE_BADGES[correlation.confidence];
          
          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition"
            >
              <div className="flex items-start gap-3">
                {/* Phase icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${phaseInfo?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white shadow-sm`}>
                  <span className="text-lg">{phaseInfo?.icon || '📊'}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {correlation.finding}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceBadge.class}`}>
                      {confidenceBadge.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {correlation.type === 'mood' ? '😊 Mood' : '📋 Symptom'}
                    </span>
                  </div>
                </div>

                {/* Visual indicator */}
                {correlation.type === 'mood' && correlation.comparison && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      correlation.value > correlation.comparison 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {correlation.value > correlation.comparison ? '↑' : '↓'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
        💡 Patterns detected from your data. Continue tracking for more accurate insights.
      </p>
    </div>
  );
}
