'use client';

import { useState } from 'react';
import { symptom } from '@/lib/api';

const SYMPTOM_TYPES = [
  { value: 'ACNE', label: 'Acne' },
  { value: 'HAIR_LOSS', label: 'Hair Loss/Thinning' },
  { value: 'EXCESS_HAIR', label: 'Excess Hair Growth' },
  { value: 'WEIGHT_GAIN', label: 'Weight Gain' },
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'FATIGUE', label: 'Fatigue' },
  { value: 'SLEEP_ISSUES', label: 'Sleep Issues' },
  { value: 'MOOD_SWINGS', label: 'Mood Swings' },
  { value: 'BLOATING', label: 'Bloating' },
  { value: 'IRREGULAR_PERIODS', label: 'Irregular Periods' },
  { value: 'PAIN', label: 'Pain/Cramps' },
  { value: 'OTHER', label: 'Other' }
];

const SEVERITY_LEVELS = [
  { value: 1, emoji: '😊', label: 'Minimal', description: 'Barely noticeable, doesn\'t affect daily life' },
  { value: 2, emoji: '😐', label: 'Mild', description: 'Noticeable but manageable, minor impact' },
  { value: 3, emoji: '😟', label: 'Moderate', description: 'Affects daily activities, requires management' },
  { value: 4, emoji: '😢', label: 'Severe', description: 'Significantly impacts quality of life' },
  { value: 5, emoji: '😭', label: 'Very Severe', description: 'Debilitating, major lifestyle disruption' }
];

interface SymptomFormProps {
  onSymptomCreated: () => void;
}

export default function SymptomForm({ onSymptomCreated }: SymptomFormProps) {
  const [formData, setFormData] = useState({
    symptomType: '',
    severity: 3,
    location: '',
    notes: '',
    otherSymptom: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.symptomType) {
      setError('Please select a symptom type');
      return;
    }

    if (formData.symptomType === 'OTHER' && !formData.otherSymptom) {
      setError('Please describe the symptom');
      return;
    }

    try {
      setLoading(true);
      await symptom.create(formData);
      
      // Reset form
      setFormData({
        symptomType: '',
        severity: 3,
        location: '',
        notes: '',
        otherSymptom: ''
      });
      
      onSymptomCreated();
    } catch (err: any) {
      console.error('Error creating symptom:', err);
      setError(err.response?.data?.message || 'Failed to log symptom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Log a Symptom</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symptom Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptom Type *
          </label>
          <select
            value={formData.symptomType}
            onChange={(e) => setFormData({ ...formData, symptomType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          >
            <option value="">Select a symptom...</option>
            {SYMPTOM_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Other Symptom (conditional) */}
        {formData.symptomType === 'OTHER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Symptom *
            </label>
            <input
              type="text"
              value={formData.otherSymptom}
              onChange={(e) => setFormData({ ...formData, otherSymptom: e.target.value })}
              placeholder="E.g., Hot flashes, Headaches..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={100}
              required
            />
          </div>
        )}

        {/* Severity Scale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity Level *
          </label>
          <div className="space-y-2">
            {SEVERITY_LEVELS.map(level => (
              <div
                key={level.value}
                onClick={() => setFormData({ ...formData, severity: level.value })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.severity === level.value
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{level.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {level.value} - {level.label}
                      </span>
                      {formData.severity === level.value && (
                        <span className="text-pink-500">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location (Optional)
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="E.g., Face, Back, Lower abdomen..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Where are you experiencing this symptom?
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional details..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Symptom Entry'}
        </button>
      </form>
    </div>
  );
}
