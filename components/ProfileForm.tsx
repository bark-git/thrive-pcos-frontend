'use client';

import { useState, useEffect } from 'react';
import { user } from '@/lib/api';
import { format } from 'date-fns';

export default function ProfileForm() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosisDate: '',
    timezone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await user.getProfile();
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        dateOfBirth: profileData.dateOfBirth 
          ? format(new Date(profileData.dateOfBirth), 'yyyy-MM-dd') 
          : '',
        diagnosisDate: profileData.diagnosisDate 
          ? format(new Date(profileData.diagnosisDate), 'yyyy-MM-dd') 
          : '',
        timezone: profileData.timezone || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      await user.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      loadProfile(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
            maxLength={50}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            maxLength={50}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* PCOS Diagnosis Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PCOS Diagnosis Date
          </label>
          <input
            type="date"
            value={formData.diagnosisDate}
            onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            When were you diagnosed with PCOS?
          </p>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select timezone...</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Anchorage">Alaska Time (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
        </div>

        {/* Subscription Tier (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subscription Plan
          </label>
          <input
            type="text"
            value={profile?.subscriptionTier || 'FREE'}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
