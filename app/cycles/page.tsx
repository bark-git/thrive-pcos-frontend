'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
  message?: string;
  averageSymptoms?: {
    cramps: string | null;
    bloating: string | null;
  };
}

export default function CyclesPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCycles();
    fetchStats();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await axios.get('/api/proxy/cycles');
      setCycles(res.data.cycles);
    } catch (error) {
      console.error('Error loading cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/proxy/cycles/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Cycle Tracking
            </h1>
            <p className="text-gray-600 mt-1">Track your menstrual cycles and predict patterns</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium"
          >
            + Log Period
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        {stats && stats.totalCycles >= 2 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm text-gray-500">Average</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.averageCycleLength}</p>
              <p className="text-sm text-gray-600">Days per cycle</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📅</span>
                <span className="text-sm text-gray-500">Regularity</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.regularityPercentage}%</p>
              <p className="text-sm text-gray-600">
                {stats.regularityPercentage! >= 70 ? 'Regular cycles' : 'Irregular cycles'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔮</span>
                <span className="text-sm text-gray-500">Prediction</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {stats.predictedNextPeriod ? new Date(stats.predictedNextPeriod).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Next period expected</p>
            </div>
          </>
        ) : (
          <div className="col-span-3 bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-600">{stats?.message || 'Track at least 2 cycles to see statistics'}</p>
          </div>
        )}
      </div>

      {/* Cycle List */}
      <div className="max-w-6xl mx-auto mt-6">
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
                      
                      {(cycle.cramps !== null || cycle.bloating !== null) && (
                        <div className="flex gap-3 mt-2">
                          {cycle.cramps !== null && (
                            <div className="text-sm">
                              <span className="text-gray-600">Cramps:</span>
                              <span className="ml-1 font-medium">{cycle.cramps}/5</span>
                            </div>
                          )}
                          {cycle.bloating !== null && (
                            <div className="text-sm">
                              <span className="text-gray-600">Bloating:</span>
                              <span className="ml-1 font-medium">{cycle.bloating}/5</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {cycle.notes && (
                        <p className="text-sm text-gray-600 mt-2">{cycle.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simple Form Modal - We'll build CycleForm component next */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Log Period (Coming Soon)</h3>
            <p className="text-gray-600 mb-4">Cycle form component will be added next!</p>
            <button
              onClick={() => setShowForm(false)}
              className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
