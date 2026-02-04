'use client';

import { useState } from 'react';
import { symptom } from '@/lib/api';

const SYMPTOM_TYPES = [
  { value: 'ACNE', label: 'Acne', icon: '😕', hasLocation: true },
  { value: 'HAIR_LOSS', label: 'Hair Loss/Thinning', icon: '💇', hasLocation: true },
  { value: 'EXCESS_HAIR', label: 'Excess Hair Growth', icon: '🪒', hasLocation: true },
  { value: 'WEIGHT_GAIN', label: 'Weight Gain', icon: '⚖️', hasLocation: false },
  { value: 'WEIGHT_LOSS', label: 'Weight Loss', icon: '⚖️', hasLocation: false },
  { value: 'FATIGUE', label: 'Fatigue', icon: '😴', hasLocation: false },
  { value: 'SLEEP_ISSUES', label: 'Sleep Issues', icon: '😪', hasLocation: false },
  { value: 'MOOD_SWINGS', label: 'Mood Swings', icon: '😤', hasLocation: false },
  { value: 'BLOATING', label: 'Bloating', icon: '🫃', hasLocation: true },
  { value: 'IRREGULAR_PERIODS', label: 'Irregular Periods', icon: '📅', hasLocation: false },
  { value: 'PAIN', label: 'Pain/Cramps', icon: '😣', hasLocation: true },
  { value: 'HEADACHE', label: 'Headache', icon: '🤕', hasLocation: true },
  { value: 'BRAIN_FOG', label: 'Brain Fog', icon: '🧠', hasLocation: false },
  { value: 'ANXIETY', label: 'Anxiety', icon: '😰', hasLocation: false },
  { value: 'CRAVINGS', label: 'Food Cravings', icon: '🍫', hasLocation: false },
  { value: 'OTHER', label: 'Other', icon: '📝', hasLocation: true }
];

// Context questions for symptoms without location
const CONTEXT_QUESTIONS: Record<string, { label: string; placeholder: string }> = {
  'FATIGUE': { label: 'When did it start?', placeholder: 'E.g., Morning, After meals, All day...' },
  'SLEEP_ISSUES': { label: 'Type of issue', placeholder: 'E.g., Can\'t fall asleep, Waking up early, Poor quality...' },
  'MOOD_SWINGS': { label: 'Triggers (if known)', placeholder: 'E.g., Before period, Stress, No clear trigger...' },
  'WEIGHT_GAIN': { label: 'Noticed changes in', placeholder: 'E.g., Appetite, Activity level, Stress eating...' },
  'WEIGHT_LOSS': { label: 'Possible factors', placeholder: 'E.g., Appetite changes, Increased activity...' },
  'IRREGULAR_PERIODS': { label: 'Pattern', placeholder: 'E.g., Skipped, Heavy, Spotting, Late by X days...' },
  'BRAIN_FOG': { label: 'When is it worst?', placeholder: 'E.g., Morning, After eating, All day...' },
  'ANXIETY': { label: 'Triggers (if known)', placeholder: 'E.g., Work, Social, No clear trigger...' },
  'CRAVINGS': { label: 'What are you craving?', placeholder: 'E.g., Sugar, Carbs, Salty foods...' },
};

const SEVERITY_LEVELS = [
  { value: 1, emoji: '😊', label: 'Minimal', description: 'Barely noticeable' },
  { value: 2, emoji: '😐', label: 'Mild', description: 'Noticeable but manageable' },
  { value: 3, emoji: '😟', label: 'Moderate', description: 'Affects daily activities' },
  { value: 4, emoji: '😢', label: 'Severe', description: 'Significantly impacts life' },
  { value: 5, emoji: '😭', label: 'Very Severe', description: 'Debilitating' }
];

interface SymptomFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function SymptomForm({ onClose, onSubmit }: SymptomFormProps) {
  const [formData, setFormData] = useState({
    symptomType: '',
    severity: 3,
    location: '',
    notes: '',
    otherSymptom: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSymptom = SYMPTOM_TYPES.find(s => s.value === formData.symptomType);
  const hasLocation = selectedSymptom?.hasLocation ?? true;
  const contextQuestion = CONTEXT_QUESTIONS[formData.symptomType];

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
      onSubmit();
    } catch (err: any) {
      console.error('Error creating symptom:', err);
      setError(err.response?.data?.message || 'Failed to log symptom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Log Symptom</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Symptom Type Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What are you experiencing?
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SYMPTOM_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, symptomType: type.value, location: '' })}
                  className={`p-3 rounded-xl border-2 text-center transition ${
                    formData.symptomType === type.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
                  }`}
                >
                  <span className="text-2xl block mb-1">{type.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight block">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Other Symptom (conditional) */}
          {formData.symptomType === 'OTHER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe Symptom *
              </label>
              <input
                type="text"
                value={formData.otherSymptom}
                onChange={(e) => setFormData({ ...formData, otherSymptom: e.target.value })}
                placeholder="E.g., Hot flashes, Dizziness..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={100}
                required
              />
            </div>
          )}

          {/* Severity Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Severity: {SEVERITY_LEVELS.find(l => l.value === formData.severity)?.label}
            </label>
            <div className="flex justify-between gap-2">
              {SEVERITY_LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: level.value })}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition ${
                    formData.severity === level.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block">{level.emoji}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{level.value}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {SEVERITY_LEVELS.find(l => l.value === formData.severity)?.description}
            </p>
          </div>

          {/* Location - Only show for symptoms that have a physical location */}
          {formData.symptomType && hasLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="E.g., Face, Back, Lower abdomen..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={100}
              />
            </div>
          )}

          {/* Context Question - Only show for symptoms without location */}
          {formData.symptomType && !hasLocation && contextQuestion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {contextQuestion.label} (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={contextQuestion.placeholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={100}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              maxLength={1000}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.symptomType}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Log Symptom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
