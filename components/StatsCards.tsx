'use client';

import { type MoodStats } from '@/lib/api';

interface StatsCardsProps {
  stats: MoodStats | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Average Mood */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Mood</p>
            <p className="text-3xl font-bold text-gray-900">{stats.averageMood?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
          </div>
          <div className="text-4xl">
            {stats.averageMood >= 4 ? '😊' : stats.averageMood >= 3 ? '😐' : '😔'}
          </div>
        </div>
      </div>

      {/* Mood Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Trend (7 days)</p>
            <p className="text-lg font-bold text-gray-900 capitalize">{stats.moodTrend || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.totalEntries || 0} entries</p>
          </div>
          <div className="text-4xl">
            {stats.moodTrend === 'improving' ? '📈' : 
             stats.moodTrend === 'declining' ? '📉' : '➡️'}
          </div>
        </div>
      </div>

      {/* Depression Risk */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Depression (PHQ-2)</p>
            {stats.depressionRisk ? (
              <>
                <p className="text-lg font-bold text-gray-900 capitalize">{stats.depressionRisk.risk}</p>
                <p className="text-xs text-gray-500 mt-1">Score: {stats.depressionRisk.score}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data</p>
            )}
          </div>
          <div className="text-4xl">
            {stats.depressionRisk ? 
              (stats.depressionRisk.risk === 'high' ? '⚠️' : 
               stats.depressionRisk.risk === 'moderate' ? '⚡' : '✅') : '📊'}
          </div>
        </div>
      </div>

      {/* Anxiety Risk */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Anxiety (GAD-2)</p>
            {stats.anxietyRisk ? (
              <>
                <p className="text-lg font-bold text-gray-900 capitalize">{stats.anxietyRisk.risk}</p>
                <p className="text-xs text-gray-500 mt-1">Score: {stats.anxietyRisk.score}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data</p>
            )}
          </div>
          <div className="text-4xl">
            {stats.anxietyRisk ? 
              (stats.anxietyRisk.risk === 'high' ? '⚠️' : 
               stats.anxietyRisk.risk === 'moderate' ? '⚡' : '✅') : '📊'}
          </div>
        </div>
      </div>
    </div>
  );
}
