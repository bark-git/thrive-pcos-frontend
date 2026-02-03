'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, exportData } from '@/lib/api';
import Header from '@/components/Header';

type ExportType = 'mood-csv' | 'symptoms-csv' | 'all-csv' | 'mood-pdf' | 'symptoms-pdf' | 'all-pdf';

export default function ExportPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [dateRange, setDateRange] = useState<string>('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async (type: ExportType) => {
    try {
      setExporting(type);
      setMessage({ type: '', text: '' });
      
      let blob: Blob;
      let filename: string;
      const date = new Date().toISOString().split('T')[0];

      switch (type) {
        case 'mood-csv':
          blob = await exportData.moodCSV(dateRange);
          filename = `thrive-pcos-mood-${dateRange}-${date}.csv`;
          break;
        case 'symptoms-csv':
          blob = await exportData.symptomsCSV(dateRange);
          filename = `thrive-pcos-symptoms-${dateRange}-${date}.csv`;
          break;
        case 'all-csv':
          blob = await exportData.allCSV(dateRange);
          filename = `thrive-pcos-complete-${dateRange}-${date}.csv`;
          break;
        case 'mood-pdf':
          blob = await exportData.moodPDF(dateRange);
          filename = `thrive-pcos-mood-report-${dateRange}-${date}.pdf`;
          break;
        case 'symptoms-pdf':
          blob = await exportData.symptomsPDF(dateRange);
          filename = `thrive-pcos-symptoms-report-${dateRange}-${date}.pdf`;
          break;
        case 'all-pdf':
          blob = await exportData.allPDF(dateRange);
          filename = `thrive-pcos-complete-report-${dateRange}-${date}.pdf`;
          break;
      }

      downloadBlob(blob, filename);
      setMessage({ type: 'success', text: `Successfully exported ${filename}` });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setExporting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50">
      <Header currentPage="profile" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Export Your Data</h2>
          <p className="text-gray-600 mt-2">Download your health data to share with your healthcare provider or keep for your records.</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Date Range Selector */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              📅 Select Date Range
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: '1week', label: 'Last 7 Days' },
                { value: '2weeks', label: 'Last 2 Weeks' },
                { value: '1month', label: 'Last Month' },
                { value: '3months', label: 'Last 3 Months' },
                { value: '6months', label: 'Last 6 Months' },
                { value: '1year', label: 'Last Year' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                    dateRange === option.value
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 text-gray-600 hover:border-pink-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Complete Health Report */}
            <div className="border-2 border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">📋</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Complete Health Report</h3>
                  <p className="text-gray-600 mt-1">
                    Everything in one file: mood tracking, symptoms, cycles, medications, and lab results.
                    <span className="font-medium text-pink-600"> Perfect for doctor visits!</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('all-csv')}
                  disabled={exporting !== null}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {exporting === 'all-csv' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Exporting...
                    </span>
                  ) : (
                    '📊 Download CSV'
                  )}
                </button>
                <button
                  onClick={() => handleExport('all-pdf')}
                  disabled={exporting !== null}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {exporting === 'all-pdf' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </span>
                  ) : (
                    '📄 Download PDF Report'
                  )}
                </button>
              </div>
            </div>

            {/* Individual Export Options */}
            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Or export individual data types:</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Mood Data */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">😊</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mood & Mental Health</h4>
                    <p className="text-sm text-gray-500">Mood entries & screening results</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('mood-csv')}
                    disabled={exporting !== null}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50 font-medium text-sm"
                  >
                    {exporting === 'mood-csv' ? 'Exporting...' : 'CSV'}
                  </button>
                  <button
                    onClick={() => handleExport('mood-pdf')}
                    disabled={exporting !== null}
                    className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition disabled:opacity-50 font-medium text-sm"
                  >
                    {exporting === 'mood-pdf' ? 'Creating...' : 'PDF'}
                  </button>
                </div>
              </div>

              {/* Symptom Data */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Symptom Tracking</h4>
                    <p className="text-sm text-gray-500">All symptom logs with severity</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('symptoms-csv')}
                    disabled={exporting !== null}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50 font-medium text-sm"
                  >
                    {exporting === 'symptoms-csv' ? 'Exporting...' : 'CSV'}
                  </button>
                  <button
                    onClick={() => handleExport('symptoms-pdf')}
                    disabled={exporting !== null}
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition disabled:opacity-50 font-medium text-sm"
                  >
                    {exporting === 'symptoms-pdf' ? 'Creating...' : 'PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Format Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 About Export Formats</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>CSV:</strong> Opens in Excel/Google Sheets - great for detailed analysis</li>
              <li>• <strong>PDF:</strong> Professionally formatted report - perfect for sharing with doctors</li>
              <li>• <strong>Complete Report:</strong> Multi-page PDF with mood, symptoms, cycles, medications, and labs</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
