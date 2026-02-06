'use client';

import { useState } from 'react';
import { symptom } from '@/lib/api';

const QUICK_SYMPTOMS = [
  { value: 'FATIGUE', label: 'Fatigue', icon: '😴' },
  { value: 'BLOATING', label: 'Bloating', icon: '🫃' },
  { value: 'PAIN', label: 'Pain/Cramps', icon: '😣' },
  { value: 'HEADACHE', label: 'Headache', icon: '🤕' },
  { value: 'MOOD_SWINGS', label: 'Mood Swings', icon: '😤' },
  { value: 'ACNE', label: 'Acne', icon: '😕' },
  { value: 'BRAIN_FOG', label: 'Brain Fog', icon: '🧠' },
  { value: 'CRAVINGS', label: 'Cravings', icon: '🍫' },
  { value: 'SLEEP_ISSUES', label: 'Sleep Issues', icon: '😪' },
  { value: 'ANXIETY', label: 'Anxiety', icon: '😰' },
];

interface QuickSymptomFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function QuickSymptomForm({ onClose, onSubmit }: QuickSymptomFormProps) {
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [severity, setSeverity] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedSymptom) {
      setError('Please select a symptom');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await symptom.create({
        symptomType: selectedSymptom,
        severity,
        notes: ''
      });
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log symptom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Log Symptom</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Quick Symptom Grid */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are you experiencing?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SYMPTOMS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedSymptom(s.value)}
                className={`p-3 rounded-xl border-2 text-left transition ${
                  selectedSymptom === s.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-2xl mb-1 block">{s.icon}</span>
                <span className="text-sm font-medium text-gray-900">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Severity: {severity}/5
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mild</span>
            <input
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-sm text-gray-500">Severe</span>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedSymptom}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Log Symptom'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Need more options? <a href="/symptoms" className="text-purple-600 hover:underline">Go to full form</a>
        </p>
      </div>
    </div>
  );
}
