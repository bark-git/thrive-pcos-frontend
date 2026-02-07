'use client';

import { useState } from 'react';
import { exportData } from '@/lib/api';

type ExportType = 'mood-csv' | 'symptoms-csv' | 'all-csv' | 'mood-pdf' | 'symptoms-pdf' | 'all-pdf';

export default function DataExport() {
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [dateRange, setDateRange] = useState<string>('all');
  const [message, setMessage] = useState({ type: '', text: '' });

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

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Export Your Data</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Download your health data to share with your healthcare provider or keep for your records.
      </p>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Date Range Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition ${
                dateRange === option.value
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-pink-300 dark:hover:border-pink-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complete Health Report - Featured */}
      <div className="border-2 border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-3xl">📋</span>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Complete Health Report</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Everything in one file: mood tracking, symptoms, cycles, medications, and lab results.
              <span className="font-medium text-pink-600 dark:text-pink-400"> Perfect for doctor visits!</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('all-csv')}
            disabled={exporting !== null}
            className="flex-1 px-4 py-2.5 bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          >
            {exporting === 'all-csv' ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </span>
            ) : (
              '📊 Download CSV'
            )}
          </button>
          <button
            onClick={() => handleExport('all-pdf')}
            disabled={exporting !== null}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          >
            {exporting === 'all-pdf' ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </span>
            ) : (
              '📄 Download PDF Report'
            )}
          </button>
        </div>
      </div>

      {/* Individual Export Options */}
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Or export individual data types:</h4>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Mood Data */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">😊</span>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Mood & Mental Health</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mood entries & screening results</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('mood-csv')}
              disabled={exporting !== null}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition disabled:opacity-50 font-medium text-xs"
            >
              {exporting === 'mood-csv' ? 'Exporting...' : 'CSV'}
            </button>
            <button
              onClick={() => handleExport('mood-pdf')}
              disabled={exporting !== null}
              className="flex-1 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition disabled:opacity-50 font-medium text-xs"
            >
              {exporting === 'mood-pdf' ? 'Creating...' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Symptom Data */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📝</span>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Symptom Tracking</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">All symptom logs with severity</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('symptoms-csv')}
              disabled={exporting !== null}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition disabled:opacity-50 font-medium text-xs"
            >
              {exporting === 'symptoms-csv' ? 'Exporting...' : 'CSV'}
            </button>
            <button
              onClick={() => handleExport('symptoms-pdf')}
              disabled={exporting !== null}
              className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition disabled:opacity-50 font-medium text-xs"
            >
              {exporting === 'symptoms-pdf' ? 'Creating...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Format Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">💡 About Export Formats</h5>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• <strong>CSV:</strong> Opens in Excel/Google Sheets - great for detailed analysis</li>
          <li>• <strong>PDF:</strong> Professionally formatted report - perfect for sharing with doctors</li>
          <li>• <strong>Complete Report:</strong> Multi-page PDF with mood, symptoms, cycles, medications, and labs</li>
        </ul>
      </div>
    </div>
  );
}
