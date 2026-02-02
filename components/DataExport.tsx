'use client';

import { useState } from 'react';
import { exportData } from '@/lib/api';

type ExportType = 'mood-csv' | 'symptoms-csv' | 'all-csv' | 'mood-pdf' | 'symptoms-pdf' | 'all-pdf';

export default function DataExport() {
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [dateRange, setDateRange] = useState<string>('all');

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
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Your Data</h3>
      <p className="text-sm text-gray-600 mb-4">
        Download your health data to share with your doctor or keep for your records.
      </p>

      {/* Date Range Selector */}
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          📅 Date Range
        </label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500"
        >
          <option value="all">All Time</option>
          <option value="1week">Last 7 Days</option>
          <option value="2weeks">Last 2 Weeks</option>
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      <div className="space-y-3">
        {/* Export Mood Data */}
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">😊</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Mood & Mental Health Data</p>
              <p className="text-sm text-gray-600">All mood entries and screening results</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('mood-csv')}
              disabled={exporting !== null}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting === 'mood-csv' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                  Exporting...
                </span>
              ) : (
                '📊 CSV'
              )}
            </button>
            <button
              onClick={() => handleExport('mood-pdf')}
              disabled={exporting !== null}
              className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting === 'mood-pdf' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                '📄 PDF'
              )}
            </button>
          </div>
        </div>

        {/* Export Symptom Data */}
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">📝</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Symptom Tracking Data</p>
              <p className="text-sm text-gray-600">All symptom logs with severity ratings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('symptoms-csv')}
              disabled={exporting !== null}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting === 'symptoms-csv' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                  Exporting...
                </span>
              ) : (
                '📊 CSV'
              )}
            </button>
            <button
              onClick={() => handleExport('symptoms-pdf')}
              disabled={exporting !== null}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting === 'symptoms-pdf' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                '📄 PDF'
              )}
            </button>
          </div>
        </div>

        {/* Export Complete Data */}
        <div className="border-2 border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">📊</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Complete Health Report</p>
              <p className="text-sm text-gray-600">All mood & symptom data combined</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('all-csv')}
              disabled={exporting !== null}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting === 'all-csv' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </span>
              ) : (
                '📊 CSV'
              )}
            </button>
            <button
              onClick={() => handleExport('all-pdf')}
              disabled={exporting !== null}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {exporting === 'all-pdf' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </span>
              ) : (
                '📄 PDF Report'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 About Formats:</strong>
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• <strong>CSV:</strong> Opens in Excel/Sheets, great for detailed analysis</li>
          <li>• <strong>PDF:</strong> Formatted reports perfect for doctor visits</li>
          <li>• <strong>Complete Report:</strong> Multi-page PDF with all tracked data</li>
        </ul>
      </div>
    </div>
  );
}
