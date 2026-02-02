'use client';

import { useState, useEffect } from 'react';
import { user } from '@/lib/api';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    appointmentReminders: true,
    medicationReminders: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await user.getNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      await user.updateNotificationSettings(newSettings);
      setMessage({ type: 'success', text: 'Settings saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save settings' 
      });
      // Revert on error
      setSettings({ ...settings });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive updates and reminders via email</p>
          </div>
          <button
            onClick={() => handleToggle('emailNotifications')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.emailNotifications ? 'bg-pink-500' : 'bg-gray-300'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-600">Get browser push notifications</p>
          </div>
          <button
            onClick={() => handleToggle('pushNotifications')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.pushNotifications ? 'bg-pink-500' : 'bg-gray-300'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Weekly Report */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Weekly Summary Report</h4>
            <p className="text-sm text-gray-600">Receive a weekly summary of your health data</p>
          </div>
          <button
            onClick={() => handleToggle('weeklyReport')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.weeklyReport ? 'bg-pink-500' : 'bg-gray-300'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.weeklyReport ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Appointment Reminders */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
            <p className="text-sm text-gray-600">Get reminded about upcoming appointments</p>
          </div>
          <button
            onClick={() => handleToggle('appointmentReminders')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.appointmentReminders ? 'bg-pink-500' : 'bg-gray-300'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Medication Reminders */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Medication Reminders</h4>
            <p className="text-sm text-gray-600">Never miss your medication schedule</p>
          </div>
          <button
            onClick={() => handleToggle('medicationReminders')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.medicationReminders ? 'bg-pink-500' : 'bg-gray-300'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.medicationReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
