'use client';

import { useState } from 'react';
import axios from 'axios';

interface CycleFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CycleForm({ onClose, onSuccess }: CycleFormProps) {
  const [formData, setFormData] = useState({
    periodStartDate: '',
    periodEndDate: '',
    flowIntensity: '',
    cramps: '',
    bloating: '',
    moodSwings: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        periodStartDate: formData.periodStartDate,
        ...(formData.periodEndDate && { periodEndDate: formData.periodEndDate }),
        ...(formData.flowIntensity && { flowIntensity: formData.flowIntensity }),
        ...(formData.cramps && { cramps: parseInt(formData.cramps) }),
        ...(formData.bloating && { bloating: parseInt(formData.bloating) }),
        ...(formData.moodSwings && { moodSwings: parseInt(formData.moodSwings) }),
        ...(formData.notes && { notes: formData.notes })
      };

      await axios.post('/api/proxy/cycles', payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Log Period
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.periodStartDate}
                onChange={(e) => setFormData({ ...formData, periodStartDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period End Date (optional)
              </label>
              <input
                type="date"
                value={formData.periodEndDate}
                onChange={(e) => setFormData({ ...formData, periodEndDate: e.target.value })}
                min={formData.periodStartDate}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Flow Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flow Intensity
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'SPOTTING', label: 'Spotting', emoji: '💧' },
                { value: 'LIGHT', label: 'Light', emoji: '💦' },
                { value: 'MODERATE', label: 'Moderate', emoji: '🌊' },
                { value: 'HEAVY', label: 'Heavy', emoji: '🌀' }
              ].map((flow) => (
                <button
                  key={flow.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, flowIntensity: flow.value })}
                  className={`px-4 py-3 rounded-lg border-2 transition ${
                    formData.flowIntensity === flow.value
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{flow.emoji}</div>
                  <div className="text-sm font-medium">{flow.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Severity Sliders */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Symptom Severity (0-5)</h3>
            
            {/* Cramps */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Cramps</label>
                <span className="text-sm text-gray-600">
                  {formData.cramps ? `${formData.cramps}/5` : 'Not tracked'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={formData.cramps}
                onChange={(e) => setFormData({ ...formData, cramps: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Bloating */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Bloating</label>
                <span className="text-sm text-gray-600">
                  {formData.bloating ? `${formData.bloating}/5` : 'Not tracked'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={formData.bloating}
                onChange={(e) => setFormData({ ...formData, bloating: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Mood Swings */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Mood Swings</label>
                <span className="text-sm text-gray-600">
                  {formData.moodSwings ? `${formData.moodSwings}/5` : 'Not tracked'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={formData.moodSwings}
                onChange={(e) => setFormData({ ...formData, moodSwings: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              maxLength={500}
              rows={3}
              placeholder="Any additional details about this period..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500 characters</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.periodStartDate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging...' : 'Log Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
