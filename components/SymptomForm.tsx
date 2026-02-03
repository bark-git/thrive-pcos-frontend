'use client';

import { useState } from 'react';
import { symptom } from '@/lib/api';

const SYMPTOM_TYPES = [
  { value: 'ACNE', label: 'Acne', hasLocation: true },
  { value: 'HAIR_LOSS', label: 'Hair Loss/Thinning', hasLocation: true },
  { value: 'EXCESS_HAIR', label: 'Excess Hair Growth', hasLocation: true },
  { value: 'WEIGHT_GAIN', label: 'Weight Gain', hasLocation: false },
  { value: 'WEIGHT_LOSS', label: 'Weight Loss', hasLocation: false },
  { value: 'FATIGUE', label: 'Fatigue', hasLocation: false },
  { value: 'SLEEP_ISSUES', label: 'Sleep Issues', hasLocation: false },
  { value: 'MOOD_SWINGS', label: 'Mood Swings', hasLocation: false },
  { value: 'BLOATING', label: 'Bloating', hasLocation: true },
  { value: 'IRREGULAR_PERIODS', label: 'Irregular Periods', hasLocation: false },
  { value: 'PAIN', label: 'Pain/Cramps', hasLocation: true },
  { value: 'HEADACHE', label: 'Headache', hasLocation: true },
  { value: 'BRAIN_FOG', label: 'Brain Fog', hasLocation: false },
  { value: 'ANXIETY', label: 'Anxiety', hasLocation: false },
  { value: 'CRAVINGS', label: 'Food Cravings', hasLocation: false },
  { value: 'OTHER', label: 'Other', hasLocation: true }
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
            onChange={(e) => setFormData({ ...formData, symptomType: e.target.value, location: '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
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

        {/* Location - Only show for symptoms that have a physical location */}
        {formData.symptomType && hasLocation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="E.g., Face, Back, Lower abdomen..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              Where are you experiencing this symptom?
            </p>
          </div>
        )}

        {/* Context Question - Only show for symptoms without location */}
        {formData.symptomType && !hasLocation && contextQuestion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {contextQuestion.label} (Optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={contextQuestion.placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
              maxLength={100}
            />
          </div>
        )}

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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-gray-900"
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
