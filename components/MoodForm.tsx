'use client';

import { useState } from 'react';
import { mood } from '@/lib/api';

interface MoodFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function MoodForm({ onClose, onSubmit }: MoodFormProps) {
  const [formData, setFormData] = useState({
    moodScore: 3,
    phq2_1: 0,
    phq2_2: 0,
    gad2_1: 0,
    gad2_2: 0,
    energyLevel: '' as 'LOW' | 'MEDIUM' | 'HIGH' | '',
    anxietyLevel: '' as 'NONE' | 'LITTLE' | 'VERY' | '',
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
        moodScore: formData.moodScore,
        notes: formData.notes || undefined,
      };

      if (formData.phq2_1 || formData.phq2_2) {
        data.phq2_1 = formData.phq2_1;
        data.phq2_2 = formData.phq2_2;
      }

      if (formData.gad2_1 || formData.gad2_2) {
        data.gad2_1 = formData.gad2_1;
        data.gad2_2 = formData.gad2_2;
      }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Log Your Mood</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mood Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Mood Today
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData({ ...formData, moodScore: score })}
                  className={`flex-1 py-3 rounded-lg border-2 transition text-gray-900 ${
                    formData.moodScore === score
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {score === 1 ? '😞' : score === 2 ? '😕' : score === 3 ? '😐' : score === 4 ? '🙂' : '😊'}
                  </div>
                  <div className="text-xs text-gray-600">{score}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PHQ-2 (Depression Screening) */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">Depression Screening (PHQ-2)</h3>
            <p className="text-sm text-gray-600 mb-4">Over the last 2 weeks, how often have you been bothered by:</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">1. Little interest or pleasure in doing things?</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, phq2_1: i })}
                      className={`py-2 px-3 rounded-lg border text-xs transition text-gray-900 ${
                        formData.phq2_1 === i
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">2. Feeling down, depressed, or hopeless?</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, phq2_2: i })}
                      className={`py-2 px-3 rounded-lg border text-xs transition text-gray-900 ${
                        formData.phq2_2 === i
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GAD-2 (Anxiety Screening) */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">Anxiety Screening (GAD-2)</h3>
            <p className="text-sm text-gray-600 mb-4">Over the last 2 weeks, how often have you been bothered by:</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">1. Feeling nervous, anxious, or on edge?</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, gad2_1: i })}
                      className={`py-2 px-3 rounded-lg border text-xs transition text-gray-900 ${
                        formData.gad2_1 === i
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">2. Not being able to stop or control worrying?</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, gad2_2: i })}
                      className={`py-2 px-3 rounded-lg border text-xs transition text-gray-900 ${
                        formData.gad2_2 === i
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Energy & Anxiety Levels */}
          <div className="border-t pt-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
              <div className="space-y-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, energyLevel: level })}
                    className={`w-full py-2 px-4 rounded-lg border transition text-gray-900 ${
                      formData.energyLevel === level
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-300 hover:border-pink-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Today's Anxiety</label>
              <div className="space-y-2">
                {(['NONE', 'LITTLE', 'VERY'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, anxietyLevel: level })}
                    className={`w-full py-2 px-4 rounded-lg border transition text-gray-900 ${
                      formData.anxietyLevel === level
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-300 hover:border-pink-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="How are you feeling today?"
              maxLength={1000}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
