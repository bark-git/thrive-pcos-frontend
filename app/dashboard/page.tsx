'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, mood, type MoodEntry, type MoodStats } from '@/lib/api';
import MoodForm from '@/components/MoodForm';
import MoodChart from '@/components/MoodChart';
import StatsCards from '@/components/StatsCards';
import DataExport from '@/components/DataExport';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoodForm, setShowMoodForm] = useState(false);

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
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-primary-700">Thrive PCOS</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.firstName}!</p>
              </div>
              <nav className="flex space-x-4">
                <button className="text-pink-600 font-semibold">
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/symptoms')}
                  className="text-gray-600 hover:text-pink-600 transition"
                >
                  Symptoms
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="text-gray-600 hover:text-pink-600 transition"
                >
                  Profile
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowMoodForm(true)}
            className="w-full sm:w-auto bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition shadow-lg"
          >
            + Log Today's Mood
          </button>
        </div>

        {/* Mood Chart */}
        {entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Mood Trend (Last 30 Days)</h2>
            <MoodChart entries={entries} />
          </div>
        )}

        {/* Recent Entries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No mood entries yet</p>
              <p className="text-sm">Start tracking your mood to see insights!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {entry.moodScore >= 4 ? '😊' : entry.moodScore >= 3 ? '😐' : '😔'}
                        </span>
                        <div>
                          <p className="font-medium">Mood Score: {entry.moodScore}/5</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                      )}
                    </div>
                    {(entry.energyLevel || entry.anxietyLevel) && (
                      <div className="flex gap-2 text-xs">
                        {entry.energyLevel && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Energy: {entry.energyLevel}
                          </span>
                        )}
                        {entry.anxietyLevel && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            Anxiety: {entry.anxietyLevel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Export Section */}
        <div className="mt-6">
          <DataExport />
        </div>
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
