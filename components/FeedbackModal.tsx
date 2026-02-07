'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from '@/components/Toast';

interface FeedbackModalProps {
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug Report', icon: '🐛', description: 'Something isn\'t working right' },
  { id: 'feature', label: 'Feature Request', icon: '💡', description: 'Suggest a new feature' },
  { id: 'improvement', label: 'Improvement', icon: '✨', description: 'Make something better' },
  { id: 'other', label: 'Other', icon: '💬', description: 'General feedback' },
];

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [includeEmail, setIncludeEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType || !message.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/email/feedback', {
        type: feedbackType,
        message: message.trim(),
        contactEmail: includeEmail ? email : null
      });
      
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit feedback. Please try again.';
      toast.error('Submission failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💚</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank you!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your feedback helps us make Thrive better for everyone with PCOS.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Share Feedback 💬</h2>
              <p className="text-white/80 text-sm mt-1">Help us improve Thrive PCOS</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FEEDBACK_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFeedbackType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    feedbackType === type.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{type.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white block">{type.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tell us more
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'bug' 
                  ? 'Please describe what happened and what you expected to happen...'
                  : feedbackType === 'feature'
                  ? 'Describe the feature you\'d like to see...'
                  : 'Share your thoughts...'
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmail}
                onChange={(e) => setIncludeEmail(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>I'd like to be contacted about this feedback</span>
            </label>
            
            {includeEmail && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-3 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedbackType || !message.trim() || submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </span>
              ) : (
                'Send Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
