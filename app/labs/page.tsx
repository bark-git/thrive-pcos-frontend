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
  HORMONES: 'bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300',
  METABOLIC: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  THYROID: 'bg-peach-100 dark:bg-peach-900/40 text-peach-700 dark:text-peach-300',
  VITAMINS: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  LIPIDS: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  OTHER: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">↓ Low</span>;
      case 'HIGH':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs">↑ High</span>;
      case 'FLAGGED_FOR_DISCUSSION':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">📌 For Discussion</span>;
      default:
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs">✓ Normal</span>;
    }
  };

  const filteredResults = viewMode === 'latest' ? latestResults : labResults;
  const displayResults = filterCategory === 'ALL' 
    ? filteredResults 
    : filteredResults.filter(r => r.category === filterCategory);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-sage-50 to-peach-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sage-50 to-peach-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header currentPage="labs" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lab Results</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and monitor your lab tests over time</p>
          </div>
          <button
            onClick={() => {
              setEditingResult(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-sage-500 to-sage-400 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-peach-600">{stats.uniqueTests}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Tests Tracked</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-sage-600">{stats.totalResults}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Total Results</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-red-500">{stats.abnormalCount}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Out of Range</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-yellow-500">{stats.flaggedForDiscussion}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">For Discussion</div>
            </div>
          </div>
        )}

        {/* Abnormal Results Alert */}
        {abnormalResults.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
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
                  className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                >
                  {result.testName}: {result.value} {result.unit} {result.flagStatus === 'LOW' ? '↓' : '↑'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('latest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'latest'
                    ? 'bg-sage-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Latest Results
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'all'
                    ? 'bg-sage-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {viewMode === 'latest' ? 'Latest Result for Each Test' : 'All Results'} ({displayResults.length})
          </h3>

          {displayResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No lab results found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sage-600 hover:text-sage-700 font-medium"
              >
                Add your first lab result
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayResults.map((result) => (
                <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-sage-300 dark:hover:border-sage-600 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{result.testName}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${CATEGORY_COLORS[result.category || 'OTHER']}`}>
                          {CATEGORY_LABELS[result.category || 'OTHER']}
                        </span>
                        {getFlagBadge(result)}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.value}</span>
                        <span className="text-gray-600 dark:text-gray-400">{result.unit}</span>
                        {result.referenceRange && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            (ref: {result.referenceRange})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(result.testDate)}
                        {result.labName && ` • ${result.labName}`}
                      </div>
                      {result.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowTrend({ testCode: result.testCode || result.testName, testName: result.testName })}
                        className="p-2 text-gray-400 hover:text-peach-500 hover:bg-peach-50 dark:hover:bg-peach-900/30 rounded-lg transition"
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
                            ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
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
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingResult(result)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Delete Lab Result</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the <strong className="text-gray-900 dark:text-white">{deletingResult.testName}</strong> result from {formatDate(deletingResult.testDate)}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingResult(null)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
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
