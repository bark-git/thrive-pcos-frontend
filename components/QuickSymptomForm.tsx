'use client';

import { useState } from 'react';
import { symptom } from '@/lib/api';

const QUICK_SYMPTOMS = [
  { value: 'FATIGUE', label: 'Fatigue', icon: '😴', hasLocation: false },
  { value: 'BLOATING', label: 'Bloating', icon: '🫃', hasLocation: true },
  { value: 'PAIN', label: 'Pain/Cramps', icon: '😣', hasLocation: true },
  { value: 'HEADACHE', label: 'Headache', icon: '🤕', hasLocation: true },
  { value: 'MOOD_SWINGS', label: 'Mood Swings', icon: '😤', hasLocation: false },
  { value: 'ACNE', label: 'Acne', icon: '😕', hasLocation: true },
  { value: 'BRAIN_FOG', label: 'Brain Fog', icon: '🧠', hasLocation: false },
  { value: 'CRAVINGS', label: 'Cravings', icon: '🍫', hasLocation: false },
  { value: 'SLEEP_ISSUES', label: 'Sleep Issues', icon: '😪', hasLocation: false },
  { value: 'ANXIETY', label: 'Anxiety', icon: '😰', hasLocation: false },
];

// Context questions for symptoms without location
const CONTEXT_QUESTIONS: Record<string, { label: string; placeholder: string }> = {
  'FATIGUE': { label: 'When did it start?', placeholder: 'E.g., Morning, After meals, All day...' },
  'SLEEP_ISSUES': { label: 'Type of issue', placeholder: 'E.g., Can\'t fall asleep, Waking up early...' },
  'MOOD_SWINGS': { label: 'Triggers (if known)', placeholder: 'E.g., Before period, Stress...' },
  'BRAIN_FOG': { label: 'When is it worst?', placeholder: 'E.g., Morning, After eating, All day...' },
  'ANXIETY': { label: 'Triggers (if known)', placeholder: 'E.g., Work, Social, No clear trigger...' },
  'CRAVINGS': { label: 'What are you craving?', placeholder: 'E.g., Sugar, Carbs, Salty foods...' },
};

// Location suggestions for symptoms with location
const LOCATION_SUGGESTIONS: Record<string, string[]> = {
  'PAIN': ['Lower abdomen', 'Back', 'Pelvis', 'Legs', 'General'],
  'HEADACHE': ['Forehead', 'Temples', 'Back of head', 'One side', 'All over'],
  'BLOATING': ['Upper abdomen', 'Lower abdomen', 'General'],
  'ACNE': ['Face', 'Chin/Jawline', 'Back', 'Chest', 'Multiple areas'],
};

const SEVERITY_LEVELS = [
  { value: 1, emoji: '😊', label: 'Minimal' },
  { value: 2, emoji: '😐', label: 'Mild' },
  { value: 3, emoji: '😟', label: 'Moderate' },
  { value: 4, emoji: '😢', label: 'Severe' },
  { value: 5, emoji: '😭', label: 'Very Severe' }
];

interface QuickSymptomFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function QuickSymptomForm({ onClose, onSubmit }: QuickSymptomFormProps) {
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [severity, setSeverity] = useState(3);
  const [location, setLocation] = useState('');
  const [contextAnswer, setContextAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const symptomConfig = QUICK_SYMPTOMS.find(s => s.value === selectedSymptom);
  const hasLocation = symptomConfig?.hasLocation ?? false;
  const contextQuestion = CONTEXT_QUESTIONS[selectedSymptom];
  const locationSuggestions = LOCATION_SUGGESTIONS[selectedSymptom] || [];

  const handleSubmit = async () => {
    if (!selectedSymptom) {
      setError('Please select a symptom');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Build notes from context answer if provided
      let notes = '';
      if (contextQuestion && contextAnswer) {
        notes = `${contextQuestion.label}: ${contextAnswer}`;
      }
      
      await symptom.create({
        symptomType: selectedSymptom,
        severity,
        location: hasLocation ? location : '',
        notes
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Symptom</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Symptom Grid */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What are you experiencing?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SYMPTOMS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  setSelectedSymptom(s.value);
                  setLocation('');
                  setContextAnswer('');
                }}
                className={`p-3 rounded-xl border-2 text-left transition ${
                  selectedSymptom === s.value
                    ? 'border-peach-500 bg-peach-50 dark:bg-peach-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-peach-300 dark:hover:border-peach-500'
                }`}
              >
                <span className="text-2xl mb-1 block">{s.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Selection - Better UI */}
        {selectedSymptom && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How severe is it?
            </label>
            <div className="flex justify-between gap-1">
              {SEVERITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSeverity(level.value)}
                  className={`flex-1 py-2 px-1 rounded-lg text-center transition ${
                    severity === level.value
                      ? 'bg-peach-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-lg block">{level.emoji}</span>
                  <span className="text-xs">{level.value}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {SEVERITY_LEVELS.find(l => l.value === severity)?.label}
            </p>
          </div>
        )}

        {/* Location Field (for symptoms with location) */}
        {selectedSymptom && hasLocation && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Where is it located?
            </label>
            {locationSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {locationSuggestions.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      location === loc
                        ? 'bg-peach-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Or type a specific location..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-peach-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Context Question (for symptoms without location) */}
        {selectedSymptom && !hasLocation && contextQuestion && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {contextQuestion.label}
            </label>
            <input
              type="text"
              value={contextAnswer}
              onChange={(e) => setContextAnswer(e.target.value)}
              placeholder={contextQuestion.placeholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-peach-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedSymptom}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-peach-500 to-sage-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Log Symptom'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Need more options? <a href="/symptoms" className="text-peach-600 dark:text-peach-400 hover:underline">Go to full form</a>
        </p>
      </div>
    </div>
  );
}
