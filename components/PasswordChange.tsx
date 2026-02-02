'use client';

import { useState } from 'react';
import { user } from '@/lib/api';

export default function PasswordChange() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      await user.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password *
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password *
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 6 characters
          </p>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">⚠️ Password Security Tips</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use a unique password you haven't used elsewhere</li>
          <li>• Include a mix of letters, numbers, and symbols</li>
          <li>• Avoid personal information like birthdays or names</li>
          <li>• Consider using a password manager</li>
        </ul>
      </div>
    </div>
  );
}
