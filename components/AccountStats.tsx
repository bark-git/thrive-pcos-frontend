'use client';

import { useState, useEffect } from 'react';
import { user } from '@/lib/api';

export default function AccountStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await user.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Failed to load account statistics
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Account Age */}
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-sage-900/20 dark:to-peach-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Account Age</p>
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.accountAgeDays}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">days</p>
        </div>

        {/* Mood Entries */}
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-sage-900/20 dark:to-peach-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mood Entries</p>
            <span className="text-3xl">😊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.moodEntries}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">total logged</p>
        </div>

        {/* Symptom Entries */}
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-sage-900/20 dark:to-peach-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Symptom Entries</p>
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.symptomEntries}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">total logged</p>
        </div>

        {/* Cycle Entries */}
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-sage-900/20 dark:to-peach-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cycle Entries</p>
            <span className="text-3xl">📆</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.cycleEntries}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">total logged</p>
        </div>

        {/* Medications */}
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-sage-900/20 dark:to-peach-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Medications</p>
            <span className="text-3xl">💊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.medications}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">tracked</p>
        </div>

        {/* Total Activity */}
        <div className="bg-gradient-to-br from-ivory to-sage-50 dark:from-sage-900/20 dark:to-peach-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Activity</p>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.moodEntries + stats.symptomEntries + stats.cycleEntries}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">entries</p>
        </div>
      </div>

      {/* Progress Message */}
      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎉 Your Progress</h4>
        <p className="text-gray-700 dark:text-gray-300">
          {stats.moodEntries + stats.symptomEntries > 10 
            ? "Great job staying consistent with tracking! The more data you log, the better insights you'll get into your PCOS patterns."
            : "Keep logging your mood and symptoms regularly to build up valuable health data and identify patterns."}
        </p>
      </div>
    </div>
  );
}
