'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { auth } from '@/lib/api';
import Header from '@/components/Header';
import LabForm from '@/components/LabForm';
import LabTrendChart from '@/components/LabTrendChart';

interface LabResult {
  id: string;
  testDate: string;
  testName: string;
  testCode: string | null;
  value: number;
  unit: string | null;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  referenceRange: string | null;
  flagStatus: string;
  category: string | null;
  labName: string | null;
  notes: string | null;
}

interface LabStats {
  totalResults: number;
  uniqueTests: number;
  abnormalCount: number;
  flaggedForDiscussion: number;
  byCategory: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, string> = {
  HORMONES: 'Hormones',
  METABOLIC: 'Metabolic',
  THYROID: 'Thyroid',
  VITAMINS: 'Vitamins & Minerals',
  LIPIDS: 'Lipids',
  OTHER: 'Other'
};

const CATEGORY_COLORS: Record<string, string> = {
  HORMONES: 'bg-pink-100 text-pink-700',
  METABOLIC: 'bg-blue-100 text-blue-700',
  THYROID: 'bg-purple-100 text-purple-700',
  VITAMINS: 'bg-green-100 text-green-700',
  LIPIDS: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-gray-100 text-gray-700'
};

export default function LabsPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [latestResults, setLatestResults] = useState<LabResult[]>([]);
  const [abnormalResults, setAbnormalResults] = useState<LabResult[]>([]);
  const [stats, setStats] = useState<LabStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState<LabResult | null>(null);
  const [deletingResult, setDeletingResult] = useState<LabResult | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showTrend, setShowTrend] = useState<{ testCode: string; testName: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'latest' | 'all'>('latest');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [resultsRes, statsRes] = await Promise.all([
        api.get('/labs'),
        api.get('/labs/stats')
      ]);
      setLabResults(resultsRes.data.labResults);
      setLatestResults(statsRes.data.latestResults);
      setAbnormalResults(statsRes.data.abnormalResults);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error loading lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingResult) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/labs/${deletingResult.id}`);
      setDeletingResult(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting lab result:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleFlag = async (result: LabResult) => {
    try {
      await api.put(`/labs/${result.id}/flag`);
      fetchData();
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFlagBadge = (result: LabResult) => {
    switch (result.flagStatus) {
      case 'LOW':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">↓ Low</span>;
      case 'HIGH':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">↑ High</span>;
      case 'FLAGGED_FOR_DISCUSSION':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">📌 For Discussion</span>;
      default:
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">✓ Normal</span>;
    }
  };

  const filteredResults = viewMode === 'latest' ? latestResults : labResults;
  const displayResults = filterCategory === 'ALL' 
    ? filteredResults 
    : filteredResults.filter(r => r.category === filterCategory);

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
      <Header currentPage="labs" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lab Results</h2>
            <p className="text-gray-600 mt-1">Track and monitor your lab tests over time</p>
          </div>
          <button
            onClick={() => {
              setEditingResult(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lab Result
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{stats.uniqueTests}</div>
              <div className="text-gray-600 text-sm">Tests Tracked</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-pink-600">{stats.totalResults}</div>
              <div className="text-gray-600 text-sm">Total Results</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-red-500">{stats.abnormalCount}</div>
              <div className="text-gray-600 text-sm">Out of Range</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-yellow-500">{stats.flaggedForDiscussion}</div>
              <div className="text-gray-600 text-sm">For Discussion</div>
            </div>
          </div>
        )}

        {/* Abnormal Results Alert */}
        {abnormalResults.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Results Outside Normal Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {abnormalResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setShowTrend({ testCode: result.testCode || result.testName, testName: result.testName })}
                  className="px-3 py-1 bg-white rounded-lg text-sm text-red-700 hover:bg-red-100 transition"
                >
                  {result.testName}: {result.value} {result.unit} {result.flagStatus === 'LOW' ? '↓' : '↑'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('latest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'latest'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Latest Results
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'all'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Results
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filterCategory === 'ALL'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    filterCategory === key
                      ? CATEGORY_COLORS[key].replace('100', '500').replace('700', 'white')
                      : CATEGORY_COLORS[key]
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {viewMode === 'latest' ? 'Latest Result for Each Test' : 'All Results'} ({displayResults.length})
          </h3>

          {displayResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No lab results found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-pink-600 hover:text-pink-700 font-medium"
              >
                Add your first lab result
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold text-gray-900">{result.testName}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${CATEGORY_COLORS[result.category || 'OTHER']}`}>
                          {CATEGORY_LABELS[result.category || 'OTHER']}
                        </span>
                        {getFlagBadge(result)}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{result.value}</span>
                        <span className="text-gray-600">{result.unit}</span>
                        {result.referenceRange && (
                          <span className="text-sm text-gray-500">
                            (ref: {result.referenceRange})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(result.testDate)}
                        {result.labName && ` • ${result.labName}`}
                      </div>
                      {result.notes && (
                        <p className="text-sm text-gray-600 mt-1">{result.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowTrend({ testCode: result.testCode || result.testName, testName: result.testName })}
                        className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition"
                        title="View trend"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleFlag(result)}
                        className={`p-2 rounded-lg transition ${
                          result.flagStatus === 'FLAGGED_FOR_DISCUSSION'
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                        }`}
                        title="Flag for discussion"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setEditingResult(result);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingResult(result)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
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
      </main>

      {/* Lab Form Modal */}
      {showForm && (
        <LabForm
          onClose={() => {
            setShowForm(false);
            setEditingResult(null);
          }}
          onSuccess={fetchData}
          editResult={editingResult}
        />
      )}

      {/* Trend Chart Modal */}
      {showTrend && (
        <LabTrendChart
          testCode={showTrend.testCode}
          testName={showTrend.testName}
          onClose={() => setShowTrend(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Lab Result</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the <strong>{deletingResult.testName}</strong> result from {formatDate(deletingResult.testDate)}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingResult(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
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
