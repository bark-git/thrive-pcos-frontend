'use client';

import { useState } from 'react';
import { exportData } from '@/lib/api';

export default function DataExport() {
  const [exporting, setExporting] = useState<string | null>(null);

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

  const handleExport = async (type: 'mood' | 'symptoms' | 'all') => {
    try {
      setExporting(type);
      
      let blob: Blob;
      let filename: string;
      const date = new Date().toISOString().split('T')[0];

      switch (type) {
        case 'mood':
          blob = await exportData.moodCSV();
          filename = `thrive-pcos-mood-${date}.csv`;
          break;
        case 'symptoms':
          blob = await exportData.symptomsCSV();
          filename = `thrive-pcos-symptoms-${date}.csv`;
          break;
        case 'all':
          blob = await exportData.allCSV();
          filename = `thrive-pcos-complete-export-${date}.csv`;
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
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Your Data</h3>
      <p className="text-sm text-gray-600 mb-6">
        Download your health data to share with your doctor or keep for your records.
      </p>

      <div className="space-y-3">
        {/* Export Mood Data */}
        <button
          onClick={() => handleExport('mood')}
          disabled={exporting !== null}
          className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">😊</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Mood Data</p>
              <p className="text-sm text-gray-600">All mood entries and mental health screening</p>
            </div>
          </div>
          {exporting === 'mood' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
          ) : (
            <span className="text-gray-400">CSV</span>
          )}
        </button>

        {/* Export Symptom Data */}
        <button
          onClick={() => handleExport('symptoms')}
          disabled={exporting !== null}
          className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📝</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Symptom Data</p>
              <p className="text-sm text-gray-600">All symptom logs with severity ratings</p>
            </div>
          </div>
          {exporting === 'symptoms' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
          ) : (
            <span className="text-gray-400">CSV</span>
          )}
        </button>

        {/* Export All Data */}
        <button
          onClick={() => handleExport('all')}
          disabled={exporting !== null}
          className="w-full flex items-center justify-between p-4 border-2 border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:from-pink-100 hover:to-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Complete Report</p>
              <p className="text-sm text-gray-600">All your health data in one file</p>
            </div>
          </div>
          {exporting === 'all' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
          ) : (
            <span className="text-pink-600 font-semibold">CSV</span>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> CSV files open in Excel, Google Sheets, or any spreadsheet software. 
          Perfect for sharing with your healthcare provider or analyzing your health trends.
        </p>
      </div>
    </div>
  );
}
