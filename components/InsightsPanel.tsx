'use client';

import { useEffect, useState } from 'react';
import { analytics, type DayOfWeekInsight, type MedicationInsight, type PCOSInsight } from '@/lib/api';

type TabType = 'records' | 'predict' | 'energy' | 'dayofweek' | 'medications' | 'pcos';

interface InsightsPanelProps {
  activeTab?: TabType;
}

export default function InsightsPanel({ activeTab: initialTab = 'records' }: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // All data states
  const [recordsData, setRecordsData] = useState<any>(null);
  const [recordsLoading, setRecordsLoading] = useState(true);
  
  const [predictData, setPredictData] = useState<any>(null);
  const [predictLoading, setPredictLoading] = useState(true);
  
  const [energyData, setEnergyData] = useState<any>(null);
  const [energyLoading, setEnergyLoading] = useState(true);
  
  const [dayData, setDayData] = useState<any>(null);
  const [dayLoading, setDayLoading] = useState(true);
  
  const [medData, setMedData] = useState<any>(null);
  const [medLoading, setMedLoading] = useState(true);
  
  const [pcosData, setPcosData] = useState<any>(null);
  const [pcosLoading, setPcosLoading] = useState(true);

  useEffect(() => {
    loadRecords();
    loadPredict();
    loadEnergy();
    loadDayOfWeek();
    loadMedications();
    loadPCOS();
  }, []);

  const loadRecords = async () => {
    try {
      const result = await analytics.getPersonalRecords();
      setRecordsData(result);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const loadPredict = async () => {
    try {
      const result = await analytics.getPredictive();
      setPredictData(result);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setPredictLoading(false);
    }
  };

  const loadEnergy = async () => {
    try {
      const result = await analytics.getEnergyPatterns();
      setEnergyData(result);
    } catch (error) {
      console.error('Error loading energy:', error);
    } finally {
      setEnergyLoading(false);
    }
  };

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
    { id: 'records' as TabType, label: 'Records', icon: '🏆' },
    { id: 'predict' as TabType, label: 'Predict', icon: '🔮' },
    { id: 'energy' as TabType, label: 'Energy', icon: '⚡' },
    { id: 'dayofweek' as TabType, label: 'Weekly', icon: '📅' },
    { id: 'medications' as TabType, label: 'Meds', icon: '💊' },
    { id: 'pcos' as TabType, label: 'PCOS', icon: '🎯' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      {/* Tab Header - Scrollable */}
      <div className="border-b border-gray-100 dark:border-gray-700 px-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-3 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === 'records' && (
          <RecordsContent data={recordsData} loading={recordsLoading} />
        )}
        {activeTab === 'predict' && (
          <PredictContent data={predictData} loading={predictLoading} />
        )}
        {activeTab === 'energy' && (
          <EnergyContent data={energyData} loading={energyLoading} />
        )}
        {activeTab === 'dayofweek' && (
          <DayOfWeekContent data={dayData} loading={dayLoading} />
        )}
        {activeTab === 'medications' && (
          <MedicationsContent data={medData} loading={medLoading} />
        )}
        {activeTab === 'pcos' && (
          <PCOSContent data={pcosData} loading={pcosLoading} />
        )}
      </div>
    </div>
  );
}

// ============================================
// RECORDS CONTENT (Personal Records)
// ============================================
function RecordsContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data?.unlocked) {
    return (
      <LockedState 
        icon="🏆"
        title="Track for 7+ days"
        description="Log your mood for at least a week to see personal records"
        current={data?.currentCount || 0}
        target={7}
      />
    );
  }

  const { records, stats } = data;

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-3 text-center">
            <span className="text-2xl">🔥</span>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 text-center">
            <span className="text-2xl">📊</span>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalEntries}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Logs</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 text-center">
            <span className="text-2xl">😊</span>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.thisWeekAvg || '--'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Week Avg</p>
          </div>
        </div>
      )}

      {/* Records List */}
      {records && records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record: any, i: number) => (
            <div 
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                record.isNew 
                  ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' 
                  : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <span className="text-2xl">{record.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{record.title}</p>
                  {record.isNew && (
                    <span className="px-1.5 py-0.5 text-xs bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 rounded">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{record.detail}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-pink-600 dark:text-pink-400">{record.value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <span className="text-3xl">📈</span>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Keep tracking to earn records!</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// PREDICT CONTENT (Predictive Insights)
// ============================================
function PredictContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data?.unlocked) {
    return (
      <LockedState 
        icon="🔮"
        title={data?.message || "Need more data"}
        description="Log at least 2 complete cycles and 10 symptoms to enable predictions"
        current={data?.currentCycles || data?.currentCount || 0}
        target={2}
      />
    );
  }

  const { predictions, currentCycleDay, avgCycleLength } = data;

  return (
    <div className="space-y-4">
      {/* Current Cycle Info */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Current Cycle Day</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{currentCycleDay}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600 dark:text-gray-400">of ~{avgCycleLength} days</p>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${Math.min(100, (currentCycleDay / avgCycleLength) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Coming up based on your patterns:
        </p>
        
        {predictions && predictions.length > 0 ? (
          <div className="space-y-3">
            {predictions.map((pred: any, i: number) => (
              <div 
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  pred.type === 'period' 
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                    : pred.confidence === 'high'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700'
                }`}
              >
                <span className="text-2xl">{pred.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{pred.title}</p>
                    <span className={`px-1.5 py-0.5 text-xs rounded ${
                      pred.confidence === 'high' 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {pred.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pred.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {pred.daysAway === 1 ? 'Tomorrow' : `${pred.daysAway} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-3xl">✨</span>
            <p className="text-gray-600 dark:text-gray-400 mt-2">No strong patterns detected yet</p>
            <p className="text-xs text-gray-500">Keep tracking to improve predictions</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Predictions are based on your historical patterns and may not be accurate.
      </p>
    </div>
  );
}

// ============================================
// ENERGY CONTENT (Energy Patterns)
// ============================================
function EnergyContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data?.unlocked) {
    return (
      <LockedState 
        icon="⚡"
        title="Track energy levels"
        description="Log energy levels for at least 7 days to see patterns"
        current={data?.currentCount || 0}
        target={7}
      />
    );
  }

  const { dayStats, phaseStats, bestEnergyDay, worstEnergyDay, bestEnergyPhase, worstEnergyPhase, energyTrend, distribution, insights } = data;

  const ENERGY_COLORS = {
    high: 'bg-green-400 dark:bg-green-500',
    medium: 'bg-yellow-400 dark:bg-yellow-500',
    low: 'bg-red-400 dark:bg-red-500'
  };

  return (
    <div className="space-y-5">
      {/* Energy Distribution */}
      {distribution && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Energy Distribution</p>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div className={`${ENERGY_COLORS.high}`} style={{ width: `${distribution.high}%` }} title={`High: ${distribution.high}%`} />
            <div className={`${ENERGY_COLORS.medium}`} style={{ width: `${distribution.medium}%` }} title={`Medium: ${distribution.medium}%`} />
            <div className={`${ENERGY_COLORS.low}`} style={{ width: `${distribution.low}%` }} title={`Low: ${distribution.low}%`} />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>⚡ High {distribution.high}%</span>
            <span>➡️ Medium {distribution.medium}%</span>
            <span>🪫 Low {distribution.low}%</span>
          </div>
        </div>
      )}

      {/* Best/Worst Summary */}
      <div className="grid grid-cols-2 gap-3">
        {bestEnergyDay && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <span className="text-xl">⚡</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Peak Energy Day</p>
            <p className="font-bold text-green-700 dark:text-green-300">{bestEnergyDay.day}</p>
          </div>
        )}
        {worstEnergyDay && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
            <span className="text-xl">🪫</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Lowest Energy Day</p>
            <p className="font-bold text-amber-700 dark:text-amber-300">{worstEnergyDay.day}</p>
          </div>
        )}
      </div>

      {/* Energy by Day of Week */}
      {dayStats && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Energy by Day</p>
          <div className="flex items-end justify-between gap-1 h-20">
            {dayStats.map((day: any) => {
              const height = day.avgEnergy ? (day.avgEnergy / 3) * 100 : 0;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-16">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        day.avgEnergy && day.avgEnergy >= 2.5 
                          ? 'bg-green-400 dark:bg-green-500' 
                          : day.avgEnergy && day.avgEnergy <= 1.5
                          ? 'bg-red-400 dark:bg-red-500'
                          : 'bg-yellow-400 dark:bg-yellow-500'
                      }`}
                      style={{ height: `${height}%`, minHeight: day.avgEnergy ? '8px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day.shortDay}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Energy by Cycle Phase */}
      {phaseStats && phaseStats.some((p: any) => p.avgEnergy !== null) && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Energy by Cycle Phase</p>
          <div className="grid grid-cols-4 gap-2">
            {phaseStats.map((phase: any) => (
              <div 
                key={phase.phase}
                className={`text-center p-2 rounded-lg ${
                  phase.avgEnergy !== null 
                    ? 'bg-gray-50 dark:bg-gray-700' 
                    : 'bg-gray-50/50 dark:bg-gray-700/50 opacity-50'
                }`}
              >
                <p className={`text-lg font-bold ${
                  phase.avgEnergy && phase.avgEnergy >= 2.5 
                    ? 'text-green-600 dark:text-green-400' 
                    : phase.avgEnergy && phase.avgEnergy <= 1.5
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {phase.avgEnergy !== null ? phase.avgEnergy.toFixed(1) : '--'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{phase.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight: any, i: number) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">{insight.icon}</span>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{insight.finding}</p>
                  {insight.tip && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 {insight.tip}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trend Badge */}
      {energyTrend && (
        <div className={`text-center py-2 px-3 rounded-lg ${
          energyTrend === 'improving' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : energyTrend === 'declining'
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {energyTrend === 'improving' && '⬆️ Energy improving this week'}
          {energyTrend === 'declining' && '⬇️ Energy lower this week'}
          {energyTrend === 'stable' && '➡️ Energy stable this week'}
        </div>
      )}
    </div>
  );
}

// ============================================
// DAY OF WEEK CONTENT
// ============================================
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

// ============================================
// MEDICATIONS CONTENT
// ============================================
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

// ============================================
// PCOS CONTENT
// ============================================
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
      {phenotype && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Your PCOS Type</p>
          <p className="font-bold text-purple-700 dark:text-purple-300 mt-1">
            {phenotype.replace('TYPE_', 'Type ')}
          </p>
        </div>
      )}

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

// ============================================
// SHARED COMPONENTS
// ============================================
function LoadingState() {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"></div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading insights...</p>
    </div>
  );
}

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
