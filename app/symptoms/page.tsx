'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, symptom } from '@/lib/api';
import Header from '@/components/Header';
import SymptomForm from '@/components/SymptomForm';
import SymptomList from '@/components/SymptomList';

export default function SymptomsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [symptomsData, statsData] = await Promise.all([
        symptom.getAll({ limit: 30 }),
        symptom.getStats(30)
      ]);
      setSymptoms(symptomsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomCreated = () => {
    setShowForm(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header currentPage="symptoms" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Symptom Tracking</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition"
          >
            {showForm ? 'Cancel' : '+ Log Symptom'}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && stats.totalEntries > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-1">Total Symptoms</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEntries}</p>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>

            {stats.mostCommonSymptoms && stats.mostCommonSymptoms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-1">Most Common</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.mostCommonSymptoms[0].symptomType.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.mostCommonSymptoms[0].count} occurrences
                </p>
              </div>
            )}

            {stats.mostCommonSymptoms && stats.mostCommonSymptoms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-1">Avg Severity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.mostCommonSymptoms[0].averageSeverity}
                </p>
                <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
              </div>
            )}
          </div>
        )}

        {/* Symptom Form */}
        {showForm && (
          <div className="mb-6">
            <SymptomForm onSymptomCreated={handleSymptomCreated} />
          </div>
        )}

        {/* Symptom List */}
        <SymptomList symptoms={symptoms} onUpdate={loadData} />
      </main>
    </div>
  );
}
