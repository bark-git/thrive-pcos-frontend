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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-600">
        Failed to load account statistics
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Account Age */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Account Age</p>
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.accountAgeDays}</p>
          <p className="text-sm text-gray-600 mt-1">days</p>
        </div>

        {/* Mood Entries */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Mood Entries</p>
            <span className="text-3xl">😊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.moodEntries}</p>
          <p className="text-sm text-gray-600 mt-1">total logged</p>
        </div>

        {/* Symptom Entries */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Symptom Entries</p>
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.symptomEntries}</p>
          <p className="text-sm text-gray-600 mt-1">total logged</p>
        </div>

        {/* Cycle Entries */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Cycle Entries</p>
            <span className="text-3xl">📆</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.cycleEntries}</p>
          <p className="text-sm text-gray-600 mt-1">total logged</p>
        </div>

        {/* Medications */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Medications</p>
            <span className="text-3xl">💊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.medications}</p>
          <p className="text-sm text-gray-600 mt-1">tracked</p>
        </div>

        {/* Total Activity */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Activity</p>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.moodEntries + stats.symptomEntries + stats.cycleEntries}
          </p>
          <p className="text-sm text-gray-600 mt-1">entries</p>
        </div>
      </div>

      {/* Progress Message */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-2">🎉 Your Progress</h4>
        <p className="text-gray-700">
          {stats.moodEntries + stats.symptomEntries > 10 
            ? "Great job staying consistent with tracking! The more data you log, the better insights you'll get into your PCOS patterns."
            : "Keep logging your mood and symptoms regularly to build up valuable health data and identify patterns."}
        </p>
      </div>

      {/* Data Export Link */}
      <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">📥 Data Export</h4>
        <p className="text-sm text-gray-600 mb-3">
          Download all your health data in CSV or PDF format for your records or doctor visits.
        </p>
        <a
          href="/export"
          className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium"
        >
          Go to Export →
        </a>
      </div>
    </div>
  );
}
