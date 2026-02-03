'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { auth } from '@/lib/api';
import Header from '@/components/Header';
import CycleForm from '@/components/CycleForm';
import CycleCalendar from '@/components/CycleCalendar';

interface Cycle {
  id: string;
  periodStartDate: string;
  periodEndDate: string | null;
  flowIntensity: string | null;
  cramps: number | null;
  bloating: number | null;
  moodSwings: number | null;
  notes: string | null;
  createdAt: string;
}

interface CycleStats {
  totalCycles: number;
  averageCycleLength?: number;
  averagePeriodLength?: number | null;
  regularityPercentage?: number;
  predictedNextPeriod?: string;
  predictedOvulation?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  message?: string;
  averageSymptoms?: {
    cramps: string | null;
    bloating: string | null;
  };
}

export default function CyclesPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [deletingCycle, setDeletingCycle] = useState<Cycle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchCycles();
    fetchStats();
  }, [user, router]);

  const fetchCycles = async () => {
    try {
      const res = await api.get('/cycles');
      setCycles(res.data.cycles);
    } catch (error) {
      console.error('Error loading cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/cycles/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEdit = (cycle: Cycle) => {
    setEditingCycle(cycle);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingCycle) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/cycles/${deletingCycle.id}`);
      setDeletingCycle(null);
      fetchCycles();
      fetchStats();
    } catch (error) {
      console.error('Error deleting cycle:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCycle(null);
  };

  const handleFormSuccess = () => {
    fetchCycles();
    fetchStats();
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50">
      <Header currentPage="cycles" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Cycle Tracking</h2>
            <p className="text-gray-600 mt-1">Track your menstrual cycles and predict patterns</p>
          </div>
          <button
            onClick={() => {
              setEditingCycle(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium"
          >
            + Log Period
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stats Cards */}
        {stats && stats.totalCycles >= 2 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl">📊</span>
                <span className="text-xs sm:text-sm text-gray-500">Average</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averageCycleLength}</p>
              <p className="text-xs sm:text-sm text-gray-600">Days per cycle</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl">📅</span>
                <span className="text-xs sm:text-sm text-gray-500">Regularity</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.regularityPercentage}%</p>
              <p className="text-xs sm:text-sm text-gray-600">
                {stats.regularityPercentage! >= 70 ? 'Regular' : 'Irregular'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl">🔮</span>
                <span className="text-xs sm:text-sm text-gray-500">Next Period</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {stats.predictedNextPeriod ? new Date(stats.predictedNextPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Expected</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-sm p-4 sm:p-6 border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl">🌸</span>
                <span className="text-xs sm:text-sm text-purple-600">Fertile Window</span>
              </div>
              {stats.predictedOvulation ? (
                <>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {new Date(stats.predictedOvulation).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs sm:text-sm text-purple-700">
                    Ovulation ~{stats.fertileWindowStart && stats.fertileWindowEnd 
                      ? `${new Date(stats.fertileWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(stats.fertileWindowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'calculating...'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-500">-</p>
                  <p className="text-xs sm:text-sm text-gray-500">Need more data</p>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="col-span-2 lg:col-span-4 bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-600">{stats?.message || 'Track at least 2 cycles to see statistics'}</p>
          </div>
        )}
        </div>

        {/* Calendar */}
        <div className="mt-6">
          <CycleCalendar 
            cycles={cycles} 
            predictedNextPeriod={stats?.predictedNextPeriod}
            predictedOvulation={stats?.predictedOvulation}
            fertileWindowStart={stats?.fertileWindowStart}
            fertileWindowEnd={stats?.fertileWindowEnd}
          />
        </div>

        {/* Cycle List */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cycle History</h2>
          
          {cycles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No cycles logged yet. Click "Log Period" to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🩸</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(cycle.periodStartDate).toLocaleDateString()}
                            {cycle.periodEndDate && ` - ${new Date(cycle.periodEndDate).toLocaleDateString()}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {cycle.flowIntensity && `Flow: ${cycle.flowIntensity}`}
                          </p>
                        </div>
                      </div>
                      
                      {(cycle.cramps !== null || cycle.bloating !== null || cycle.moodSwings !== null) && (
                        <div className="flex gap-3 mt-2 flex-wrap">
                          {cycle.cramps !== null && (
                            <div className="text-sm">
                              <span className="text-gray-600">Cramps:</span>
                              <span className="ml-1 font-medium text-gray-900">{cycle.cramps}/5</span>
                            </div>
                          )}
                          {cycle.bloating !== null && (
                            <div className="text-sm">
                              <span className="text-gray-600">Bloating:</span>
                              <span className="ml-1 font-medium text-gray-900">{cycle.bloating}/5</span>
                            </div>
                          )}
                          {cycle.moodSwings !== null && (
                            <div className="text-sm">
                              <span className="text-gray-600">Mood Swings:</span>
                              <span className="ml-1 font-medium text-gray-900">{cycle.moodSwings}/5</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {cycle.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{cycle.notes}"</p>
                      )}
                    </div>
                    
                    {/* Edit/Delete Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(cycle)}
                        className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingCycle(cycle)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Cycle Form Modal */}
      {showForm && (
        <CycleForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editCycle={editingCycle}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCycle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Cycle Entry?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the cycle entry from{' '}
              <strong>{new Date(deletingCycle.periodStartDate).toLocaleDateString()}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCycle(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
