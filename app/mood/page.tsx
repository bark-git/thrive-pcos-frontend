'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, mood, type MoodEntry, type MoodStats } from '@/lib/api';
import Header from '@/components/Header';
import MoodForm from '@/components/MoodForm';

export default function MoodHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [filter, setFilter] = useState<'all' | '7' | '30' | '90'>('30');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router, filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const limit = filter === 'all' ? 1000 : parseInt(filter) * 2; // Extra buffer
      const [moodEntries, moodStats] = await Promise.all([
        mood.getAll({ limit }),
        mood.getStats(filter === 'all' ? 90 : parseInt(filter))
      ]);
      
      // Filter by date range if not "all"
      let filteredEntries = moodEntries;
      if (filter !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(filter));
        filteredEntries = moodEntries.filter(e => new Date(e.date) >= cutoffDate);
      }
      
      setEntries(filteredEntries);
      setStats(moodStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async () => {
    setShowMoodForm(false);
    await loadData();
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 5) return '😊';
    if (score >= 4) return '🙂';
    if (score >= 3) return '😐';
    if (score >= 2) return '😕';
    return '😞';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sage-50 dark:from-forest-900 dark:to-forest-800">
      <Header currentPage="mood" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mood History</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {entries.length} entries • Track your emotional patterns
            </p>
          </div>
          <button
            onClick={() => setShowMoodForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-400 text-white rounded-lg font-medium hover:from-sage-600 hover:to-sage-500 transition shadow-md"
          >
            + Log Mood
          </button>
        </div>

        {/* Stats Summary */}
        {stats && entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageMood?.toFixed(1) || '--'}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trend</p>
              <p className={`text-2xl font-bold ${
                stats.moodTrend === 'improving' ? 'text-green-600 dark:text-green-400' :
                stats.moodTrend === 'declining' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {stats.moodTrend === 'improving' ? '↑' : stats.moodTrend === 'declining' ? '↓' : '→'} {stats.moodTrend || '--'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Depression</p>
              <p className={`text-lg font-bold ${
                stats.depressionRisk?.risk === 'elevated' 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {stats.depressionRisk?.risk || 'N/A'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Anxiety</p>
              <p className={`text-lg font-bold ${
                stats.anxietyRisk?.risk === 'elevated' 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {stats.anxietyRisk?.risk || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: '7', label: 'Week' },
            { value: '30', label: 'Month' },
            { value: '90', label: '3 Months' },
            { value: 'all', label: 'All Time' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filter === opt.value
                  ? 'bg-sage-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-sage-50 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sage-500 mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-sage-100 dark:bg-sage-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No mood entries yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start tracking your mood to see patterns over time
            </p>
            <button
              onClick={() => setShowMoodForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-sage-500 to-sage-400 text-white rounded-lg font-medium hover:from-sage-600 hover:to-sage-500 transition"
            >
              Log Your First Mood
            </button>
          </div>
        ) : (
          /* Entries List */
          <div className="space-y-3">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Mood Score */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-4xl mb-1">{getMoodEmoji(entry.moodScore)}</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{entry.moodScore}/5</div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {entry.energyLevel && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          ⚡ {entry.energyLevel}
                        </span>
                      )}
                      {entry.anxietyLevel && (
                        <span className="px-2 py-1 bg-peach-100 dark:bg-peach-900/40 text-peach-700 dark:text-peach-300 rounded-full text-xs font-medium">
                          😰 {entry.anxietyLevel}
                        </span>
                      )}
                      {(entry.phq2_1 === 1 || entry.phq2_2 === 1) && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                          PHQ flagged
                        </span>
                      )}
                      {(entry.gad2_1 === 1 || entry.gad2_2 === 1) && (
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                          GAD flagged
                        </span>
                      )}
                    </div>
                    
                    {/* Notes */}
                    {entry.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mood Form Modal */}
      {showMoodForm && (
        <MoodForm
          onClose={() => setShowMoodForm(false)}
          onSubmit={handleMoodSubmit}
        />
      )}
    </div>
  );
}
