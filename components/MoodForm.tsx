'use client';

import { useState, useEffect } from 'react';
import { mood, type MoodEntry } from '@/lib/api';

interface MoodFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function MoodForm({ onClose, onSubmit }: MoodFormProps) {
  const [existingEntry, setExistingEntry] = useState<MoodEntry | null>(null);
  const [showExistingPrompt, setShowExistingPrompt] = useState(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  
  const [formData, setFormData] = useState({
    moodScore: 3,
    phq2_1: null as number | null,
    phq2_2: null as number | null,
    gad2_1: null as number | null,
    gad2_2: null as number | null,
    energyLevel: '' as 'LOW' | 'MEDIUM' | 'HIGH' | '',
    anxietyLevel: '' as 'NONE' | 'LITTLE' | 'VERY' | '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkTodayEntry();
  }, []);

  const checkTodayEntry = async () => {
    try {
      const result = await mood.getTodayEntry();
      if (result.hasEntry && result.entry) {
        setExistingEntry(result.entry);
        setShowExistingPrompt(true);
      }
    } catch (err) {
      console.error('Error checking today entry:', err);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleUpdateExisting = () => {
    if (existingEntry) {
      setFormData({
        moodScore: existingEntry.moodScore,
        phq2_1: existingEntry.phq2_1 ?? null,
        phq2_2: existingEntry.phq2_2 ?? null,
        gad2_1: existingEntry.gad2_1 ?? null,
        gad2_2: existingEntry.gad2_2 ?? null,
        energyLevel: existingEntry.energyLevel || '',
        anxietyLevel: existingEntry.anxietyLevel || '',
        notes: existingEntry.notes || '',
      });
      setUpdateMode(true);
    }
    setShowExistingPrompt(false);
  };

  const handleAddNew = () => {
    setShowExistingPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = {
        moodScore: formData.moodScore,
        notes: formData.notes || undefined,
        updateExisting: updateMode,
      };

      if (formData.phq2_1 !== null) data.phq2_1 = formData.phq2_1;
      if (formData.phq2_2 !== null) data.phq2_2 = formData.phq2_2;
      if (formData.gad2_1 !== null) data.gad2_1 = formData.gad2_1;
      if (formData.gad2_2 !== null) data.gad2_2 = formData.gad2_2;

      if (formData.energyLevel) data.energyLevel = formData.energyLevel;
      if (formData.anxietyLevel) data.anxietyLevel = formData.anxietyLevel;

      await mood.create(data);
      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save mood entry');
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showExistingPrompt && existingEntry) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              You've already logged today
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You logged a mood of {existingEntry.moodScore}/5 earlier. What would you like to do?
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleUpdateExisting}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition"
            >
              Update today's entry
            </button>
            <button
              onClick={handleAddNew}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Add another entry (note what changed)
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {updateMode ? 'Update Today\'s Mood' : 'Log Your Mood'}
            </h2>
            {updateMode && (
              <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">Updating your earlier entry</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mood Score */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
              How are you feeling right now?
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData({ ...formData, moodScore: score })}
                  className={`flex-1 py-3 rounded-lg border-2 transition ${
                    formData.moodScore === score
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-700'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {score === 1 ? '😞' : score === 2 ? '😕' : score === 3 ? '😐' : score === 4 ? '🙂' : '😊'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{score}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Mental Health Check */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Daily Check-in</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Quick yes/no questions to track patterns over time
            </p>
            
            <div className="space-y-4">
              {/* PHQ-2 Question 1 */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Today, did you feel little interest or pleasure in doing things?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, phq2_1: 0 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.phq2_1 === 0
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, phq2_1: 1 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.phq2_1 === 1
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* PHQ-2 Question 2 */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Today, did you feel down, depressed, or hopeless?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, phq2_2: 0 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.phq2_2 === 0
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, phq2_2: 1 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.phq2_2 === 1
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* GAD-2 Question 1 */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Today, did you feel nervous, anxious, or on edge?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gad2_1: 0 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.gad2_1 === 0
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gad2_1: 1 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.gad2_1 === 1
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* GAD-2 Question 2 */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Today, did you have trouble stopping or controlling your worrying?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gad2_2: 0 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.gad2_2 === 0
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gad2_2: 1 })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition font-medium ${
                      formData.gad2_2 === 1
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Energy & Anxiety Levels */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <label className="block text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">⚡ Energy Level</label>
              <div className="flex gap-2">
                {([
                  { value: 'LOW', label: '🔋 Low' },
                  { value: 'MEDIUM', label: '⚡ Med' },
                  { value: 'HIGH', label: '💪 High' }
                ] as const).map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, energyLevel: level.value })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition text-sm font-medium ${
                      formData.energyLevel === level.value
                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <label className="block text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3">😰 Anxiety Right Now</label>
              <div className="flex gap-2">
                {([
                  { value: 'NONE', label: '😌 None' },
                  { value: 'LITTLE', label: '😐 Some' },
                  { value: 'VERY', label: '😰 A lot' }
                ] as const).map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, anxietyLevel: level.value })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition text-sm font-medium ${
                      formData.anxietyLevel === level.value
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {!updateMode && existingEntry ? 'What changed since earlier?' : 'Notes (Optional)'}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              rows={3}
              placeholder={!updateMode && existingEntry 
                ? "Describe what changed since your earlier entry..."
                : "Any thoughts or context about how you're feeling?"
              }
              maxLength={1000}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : updateMode ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
