'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, mood, type MoodEntry, type MoodStats } from '@/lib/api';
import Header from '@/components/Header';
import MoodForm from '@/components/MoodForm';
import MoodTrendChart from '@/components/MoodTrendChart';
import CorrelationCards from '@/components/CorrelationCards';
import InsightsPanel from '@/components/InsightsPanel';
import InsightsUnlockBanner from '@/components/InsightsUnlockBanner';
import MedicationStatusCard from '@/components/MedicationStatusCard';
import DashboardHero from '@/components/DashboardHero';
import QuickSymptomForm from '@/components/QuickSymptomForm';
import QuickPeriodForm from '@/components/QuickPeriodForm';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [moodEntries, moodStats] = await Promise.all([
        mood.getAll({ limit: 30 }),
        mood.getStats(7)
      ]);
      setEntries(moodEntries);
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
    setRefreshKey(prev => prev + 1); // Trigger DashboardHero refresh
  };

  const handleSymptomSubmit = async () => {
    setShowSymptomForm(false);
    setRefreshKey(prev => prev + 1); // Trigger DashboardHero refresh
  };

  const handlePeriodSubmit = async () => {
    setShowPeriodForm(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Countdown, Phase, Quick Log, Streak */}
        <DashboardHero 
          key={refreshKey}
          userName={user.firstName || 'there'}
          onQuickLogMood={() => setShowMoodForm(true)}
          onQuickLogSymptom={() => setShowSymptomForm(true)}
          onQuickLogPeriod={() => setShowPeriodForm(true)}
        />

        {/* Status Card - Medications */}
        <div className="mb-6">
          <MedicationStatusCard />
        </div>

        {/* Insights Unlock Banner - shows when features are locked */}
        <InsightsUnlockBanner 
          key={`banner-${refreshKey}`}
          onLogMood={() => setShowMoodForm(true)}
          onLogSymptom={() => setShowSymptomForm(true)}
          onLogPeriod={() => setShowPeriodForm(true)}
        />

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Mood Trend Chart with Cycle Phase */}
          <MoodTrendChart key={`mood-${refreshKey}`} />
          
          {/* Correlation Cards */}
          <CorrelationCards key={`corr-${refreshKey}`} />
        </div>

        {/* Additional Insights */}
        <div className="mb-6">
          <InsightsPanel key={`insights-${refreshKey}`} />
        </div>

        {/* Recent Entries */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Mood Entries</h2>
            {entries.length > 0 && (
              <a href="/mood" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 text-sm font-medium">
                View all →
              </a>
            )}
          </div>
          
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2">No mood entries yet</p>
              <p className="text-sm">Your entries will appear here after you start logging.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:border-pink-200 dark:hover:border-pink-700 hover:bg-pink-50/30 dark:hover:bg-pink-900/20 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {entry.moodScore >= 4 ? '😊' : entry.moodScore >= 3 ? '😐' : '😔'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Mood: {entry.moodScore}/5</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {entry.energyLevel && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          ⚡ {entry.energyLevel}
                        </span>
                      )}
                      {entry.anxietyLevel && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                          😰 {entry.anxietyLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-12">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mood Form Modal */}
      {showMoodForm && (
        <MoodForm
          onClose={() => setShowMoodForm(false)}
          onSubmit={handleMoodSubmit}
        />
      )}

      {/* Quick Symptom Form Modal */}
      {showSymptomForm && (
        <QuickSymptomForm
          onClose={() => setShowSymptomForm(false)}
          onSubmit={handleSymptomSubmit}
        />
      )}

      {/* Quick Period Form Modal */}
      {showPeriodForm && (
        <QuickPeriodForm
          onClose={() => setShowPeriodForm(false)}
          onSubmit={handlePeriodSubmit}
        />
      )}
    </div>
  );
}
