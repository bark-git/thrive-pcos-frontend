'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface MonthlyCheckInProps {
  onClose: () => void;
  onComplete: () => void;
}

const PRIMARY_CONCERNS = [
  { id: 'irregular_periods', label: 'Irregular periods', icon: '📅' },
  { id: 'fertility', label: 'Fertility / Trying to conceive', icon: '👶' },
  { id: 'weight', label: 'Weight management', icon: '⚖️' },
  { id: 'acne', label: 'Acne / Skin issues', icon: '✨' },
  { id: 'hair_loss', label: 'Hair loss', icon: '💇' },
  { id: 'excess_hair', label: 'Excess hair growth', icon: '🪒' },
  { id: 'fatigue', label: 'Fatigue / Low energy', icon: '😴' },
  { id: 'mood', label: 'Mood / Mental health', icon: '🧠' },
  { id: 'insulin_resistance', label: 'Insulin resistance', icon: '🩸' },
  { id: 'sleep', label: 'Sleep issues', icon: '🌙' },
];

export default function MonthlyCheckIn({ onClose, onComplete }: MonthlyCheckInProps) {
  const [currentConcerns, setCurrentConcerns] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [step, setStep] = useState<'review' | 'update'>('review');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCurrentConcerns();
  }, []);

  const loadCurrentConcerns = async () => {
    try {
      const res = await api.get('/user/profile');
      const profile = res.data.profile || res.data;
      const concerns = profile?.primaryConcerns || [];
      setCurrentConcerns(concerns);
      setSelectedConcerns(concerns);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConcern = (id: string) => {
    setSelectedConcerns(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Determine what changed
      const added = selectedConcerns.filter(c => !currentConcerns.includes(c));
      const removed = currentConcerns.filter(c => !selectedConcerns.includes(c));
      
      // Save updated concerns using PATCH endpoint
      await api.patch('/user/profile', {
        primaryConcerns: selectedConcerns,
        lastCheckIn: new Date().toISOString()
      });

      // If there were changes, log them (could be a separate endpoint in future)
      if (added.length > 0 || removed.length > 0) {
        console.log('Concerns changed:', { added, removed, notes });
      }

      onComplete();
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (currentConcerns.length !== selectedConcerns.length) return true;
    return currentConcerns.some(c => !selectedConcerns.includes(c)) ||
           selectedConcerns.some(c => !currentConcerns.includes(c));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Monthly Check-in 📊</h2>
              <p className="text-white/80 text-sm mt-1">Let's see how things are going</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'review' ? (
            <>
              {/* Current Concerns Review */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Your current focus areas:
                </h3>
                
                {currentConcerns.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No concerns set yet. Let's add some!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentConcerns.map(concernId => {
                      const concern = PRIMARY_CONCERNS.find(c => c.id === concernId);
                      if (!concern) return null;
                      return (
                        <span 
                          key={concernId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          <span>{concern.icon}</span>
                          <span>{concern.label}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Question */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-5 mb-6">
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  Has anything changed this month?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your concerns might shift over time - that's completely normal! Keeping this updated helps us give you relevant insights.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
                >
                  ✓ Same as before
                </button>
                <button
                  onClick={() => setStep('update')}
                  className="flex-1 px-4 py-3 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                >
                  Things changed
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Update Concerns */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  What are your current concerns?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Select all that apply right now
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {PRIMARY_CONCERNS.map(concern => (
                    <button
                      key={concern.id}
                      onClick={() => toggleConcern(concern.id)}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        selectedConcerns.includes(concern.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-xl block mb-1">{concern.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{concern.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Field */}
              {hasChanges() && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Any notes about the changes? (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Started new medication, lifestyle changes, symptoms improved..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Change Summary */}
              {hasChanges() && (
                <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Changes:</strong>{' '}
                    {currentConcerns.filter(c => !selectedConcerns.includes(c)).length > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        Removed {currentConcerns.filter(c => !selectedConcerns.includes(c)).length} •{' '}
                      </span>
                    )}
                    {selectedConcerns.filter(c => !currentConcerns.includes(c)).length > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        Added {selectedConcerns.filter(c => !currentConcerns.includes(c)).length}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to check if monthly check-in is due
export function useMonthlyCheckIn() {
  const [isDue, setIsDue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfDue();
  }, []);

  const checkIfDue = async () => {
    try {
      const res = await api.get('/user/profile');
      const profile = res.data.profile || res.data;
      const lastCheckIn = profile?.lastCheckInDate;
      const createdAt = res.data.user?.createdAt || profile?.createdAt;
      
      if (!lastCheckIn) {
        // Never done a monthly check-in, but only show after they've been using app for 30 days
        if (createdAt) {
          const daysSinceCreation = Math.floor(
            (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          setIsDue(daysSinceCreation >= 30);
        }
      } else {
        const daysSinceLastCheckIn = Math.floor(
          (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)
        );
        setIsDue(daysSinceLastCheckIn >= 30);
      }
    } catch (error) {
      console.error('Error checking monthly check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = () => {
    setIsDue(false);
  };

  return { isDue, loading, markComplete };
}
