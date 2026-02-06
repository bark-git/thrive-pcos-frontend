'use client';

import { useEffect, useState } from 'react';
import { analytics, type DayOfWeekInsight, type MedicationInsight, type PCOSInsight } from '@/lib/api';

interface InsightsPanelProps {
  activeTab?: 'dayofweek' | 'medications' | 'pcos';
}

export default function InsightsPanel({ activeTab: initialTab = 'dayofweek' }: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Day of Week state
  const [dayData, setDayData] = useState<any>(null);
  const [dayLoading, setDayLoading] = useState(true);
  
  // Medication state
  const [medData, setMedData] = useState<any>(null);
  const [medLoading, setMedLoading] = useState(true);
  
  // PCOS state
  const [pcosData, setPcosData] = useState<any>(null);
  const [pcosLoading, setPcosLoading] = useState(true);

  useEffect(() => {
    loadDayOfWeek();
    loadMedications();
    loadPCOS();
  }, []);

  const loadDayOfWeek = async () => {
    try {
      const result = await analytics.getDayOfWeek();
      setDayData(result);
    } catch (error) {
      console.error('Error loading day of week:', error);
    } finally {
      setDayLoading(false);
    }
  };

  const loadMedications = async () => {
    try {
      const result = await analytics.getMedicationEffectiveness();
      setMedData(result);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setMedLoading(false);
    }
  };

  const loadPCOS = async () => {
    try {
      const result = await analytics.getPCOSInsights();
      setPcosData(result);
    } catch (error) {
      console.error('Error loading PCOS insights:', error);
    } finally {
      setPcosLoading(false);
    }
  };

  const tabs = [
    { id: 'dayofweek', label: 'Weekly', icon: '📅' },
    { id: 'medications', label: 'Meds', icon: '💊' },
    { id: 'pcos', label: 'PCOS', icon: '🎯' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      {/* Tab Header */}
      <div className="border-b border-gray-100 dark:border-gray-700 px-4">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {/* Day of Week Tab */}
        {activeTab === 'dayofweek' && (
          <DayOfWeekContent data={dayData} loading={dayLoading} />
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <MedicationsContent data={medData} loading={medLoading} />
        )}

        {/* PCOS Tab */}
        {activeTab === 'pcos' && (
          <PCOSContent data={pcosData} loading={pcosLoading} />
        )}
      </div>
    </div>
  );
}

// Day of Week Content
function DayOfWeekContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data?.unlocked) {
    return (
      <LockedState 
        icon="📅"
        title="Track for 7+ days"
        description="Log your mood for at least a week to see day-of-week patterns"
        current={data?.currentCount || 0}
        target={7}
      />
    );
  }

  const { dayStats, insights, bestDay, worstDay } = data;

  return (
    <div className="space-y-5">
      {/* Best/Worst Summary */}
      {bestDay && worstDay && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <span className="text-2xl">😊</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Best day</p>
            <p className="font-bold text-green-700 dark:text-green-300">{bestDay.day}</p>
            <p className="text-xs text-green-600 dark:text-green-400">{bestDay.avgMood}/5 avg</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
            <span className="text-2xl">😔</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hardest day</p>
            <p className="font-bold text-amber-700 dark:text-amber-300">{worstDay.day}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">{worstDay.avgMood}/5 avg</p>
          </div>
        </div>
      )}

      {/* Weekly Bar Chart */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mood by day of week</p>
        <div className="flex items-end justify-between gap-1 h-24">
          {dayStats.map((day: any) => {
            const height = day.avgMood ? (day.avgMood / 5) * 100 : 0;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-20">
                  {day.avgMood && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {day.avgMood}
                    </span>
                  )}
                  <div 
                    className={`w-full rounded-t transition-all ${
                      day.avgMood && day.avgMood >= 4 
                        ? 'bg-green-400 dark:bg-green-500' 
                        : day.avgMood && day.avgMood <= 2.5
                        ? 'bg-amber-400 dark:bg-amber-500'
                        : 'bg-purple-400 dark:bg-purple-500'
                    }`}
                    style={{ height: `${height}%`, minHeight: day.avgMood ? '8px' : '0' }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day.shortDay}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight: DayOfWeekInsight, i: number) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">{insight.icon}</span>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{insight.finding}</p>
                  {insight.actionable && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      💡 {insight.actionable}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Medications Content
function MedicationsContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data?.unlocked) {
    return (
      <LockedState 
        icon="💊"
        title="No medications tracked"
        description="Add your medications to see effectiveness insights over time"
        linkHref="/medications"
        linkText="Add Medication"
      />
    );
  }

  const { medications } = data;

  if (!medications || medications.length === 0) {
    return (
      <LockedState 
        icon="💊"
        title="No medications found"
        description="Track your medications to see how they're working"
        linkHref="/medications"
        linkText="Add Medication"
      />
    );
  }

  return (
    <div className="space-y-4">
      {medications.map((med: MedicationInsight, i: number) => (
        <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{med.medication}</h4>
              {med.dosage && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{med.dosage}</p>
              )}
            </div>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              {med.daysTracked} days
            </span>
          </div>

          {med.status === 'too_early' ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <span className="text-2xl">⏳</span>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{med.message}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Keep tracking to see insights</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Mood Change */}
              {med.moodFinding && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${
                  med.moodTrend === 'improved' 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : med.moodTrend === 'decreased'
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <span className="text-lg">
                    {med.moodTrend === 'improved' ? '📈' : med.moodTrend === 'decreased' ? '📉' : '➡️'}
                  </span>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{med.moodFinding}</p>
                    {med.moodChange !== undefined && (
                      <p className={`text-xs ${
                        med.moodChange > 0 ? 'text-green-600 dark:text-green-400' : 
                        med.moodChange < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                      }`}>
                        {med.moodChange > 0 ? '+' : ''}{med.moodChange} points
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Symptom Change */}
              {med.symptomFinding && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${
                  med.symptomTrend === 'improved' 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : med.symptomTrend === 'worsened'
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <span className="text-lg">
                    {med.symptomTrend === 'improved' ? '✨' : med.symptomTrend === 'worsened' ? '⚠️' : '📋'}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{med.symptomFinding}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        💡 Correlation ≠ causation. Discuss with your healthcare provider.
      </p>
    </div>
  );
}

// PCOS Content
function PCOSContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data?.unlocked) {
    return (
      <LockedState 
        icon="🎯"
        title="Track more symptoms"
        description="Log at least 5 symptoms to get PCOS-specific insights"
        current={data?.currentCount || 0}
        target={5}
      />
    );
  }

  const { insights, phenotype, symptomSummary } = data;

  const severityColors: Record<string, string> = {
    important: 'border-l-pink-500 bg-pink-50 dark:bg-pink-900/20',
    moderate: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
    mild: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
    informational: 'border-l-gray-400 bg-gray-50 dark:bg-gray-700/50',
  };

  return (
    <div className="space-y-4">
      {/* Phenotype badge if known */}
      {phenotype && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Your PCOS Type</p>
          <p className="font-bold text-purple-700 dark:text-purple-300 mt-1">
            {phenotype.replace('TYPE_', 'Type ')}
          </p>
        </div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight: PCOSInsight, i: number) => (
            <div 
              key={i} 
              className={`border-l-4 rounded-lg p-4 ${severityColors[insight.severity || 'informational']}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {insight.category}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-2">
                    {insight.finding}
                  </p>
                  <div className="flex items-start gap-1.5 bg-white/50 dark:bg-gray-800/50 rounded p-2">
                    <span className="text-yellow-500 flex-shrink-0">💡</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{insight.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <span className="text-3xl">🔍</span>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Analyzing your patterns...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Keep tracking to discover PCOS-specific insights
          </p>
        </div>
      )}

      {/* Top Symptoms */}
      {symptomSummary?.topSymptoms && symptomSummary.topSymptoms.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your most frequent symptoms:</p>
          <div className="flex flex-wrap gap-2">
            {symptomSummary.topSymptoms.map((s: { type: string; count: number }, i: number) => (
              <span 
                key={i}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs"
              >
                {s.type} ({s.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"></div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading insights...</p>
    </div>
  );
}

// Locked State
function LockedState({ 
  icon, 
  title, 
  description, 
  current, 
  target, 
  linkHref, 
  linkText 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  current?: number; 
  target?: number;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      
      {current !== undefined && target !== undefined && (
        <div className="max-w-xs mx-auto mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{current} logged</span>
            <span>{target} needed</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (current / target) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {linkHref && linkText && (
        <a
          href={linkHref}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition text-sm font-medium"
        >
          {linkText}
        </a>
      )}
    </div>
  );
}
