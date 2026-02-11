'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface QuickPeriodFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function QuickPeriodForm({ onClose, onSubmit }: QuickPeriodFormProps) {
  const [formData, setFormData] = useState({
    periodStartDate: new Date().toISOString().split('T')[0],
    flowIntensity: '' as 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SPOTTING' | '',
    cramps: 0,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = {
        periodStartDate: formData.periodStartDate,
      };

      if (formData.flowIntensity) data.flowIntensity = formData.flowIntensity;
      if (formData.cramps > 0) data.cramps = formData.cramps;
      if (formData.notes) data.notes = formData.notes;

      await api.post('/cycles', data);
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to log period');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-xl">🩸</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Period</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              When did your period start?
            </label>
            <input
              type="date"
              value={formData.periodStartDate}
              onChange={(e) => setFormData({ ...formData, periodStartDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Flow Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flow intensity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { value: 'SPOTTING', label: 'Spotting', emoji: '💧' },
                { value: 'LIGHT', label: 'Light', emoji: '🩸' },
                { value: 'MODERATE', label: 'Moderate', emoji: '🩸🩸' },
                { value: 'HEAVY', label: 'Heavy', emoji: '🩸🩸🩸' }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, flowIntensity: option.value })}
                  className={`py-2 px-2 rounded-lg border-2 transition text-center ${
                    formData.flowIntensity === option.value
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                  }`}
                >
                  <div className="text-sm mb-1">{option.emoji}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cramps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cramp severity
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, cramps: level })}
                  className={`flex-1 py-2 rounded-lg border-2 transition text-sm ${
                    formData.cramps === level
                      ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 font-medium'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sage-300'
                  }`}
                >
                  {level === 0 ? 'None' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              rows={2}
              placeholder="Any additional notes..."
              maxLength={500}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-sage-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-sage-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Log Period'}
            </button>
          </div>

          {/* Link to full cycles page */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Need to log an end date or more details?{' '}
            <a href="/cycles" className="text-sage-600 dark:text-sage-400 hover:underline">
              Go to Cycles page →
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
