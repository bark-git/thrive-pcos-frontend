'use client';

import { useState, useEffect, useRef } from 'react';
import { user } from '@/lib/api';

interface NotificationSettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsState>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    appointmentReminders: true,
    medicationReminders: true
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Store the last successfully saved settings
  const lastSavedSettings = useRef<NotificationSettingsState | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await user.getNotificationSettings();
      const loadedSettings = {
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? true,
        weeklyReport: data.weeklyReport ?? true,
        appointmentReminders: data.appointmentReminders ?? true,
        medicationReminders: data.medicationReminders ?? true
      };
      setSettings(loadedSettings);
      lastSavedSettings.current = loadedSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationSettingsState) => {
    // Store the previous value for potential rollback
    const previousValue = settings[key];
    const newSettings = { ...settings, [key]: !previousValue };
    
    // Optimistically update UI
    setSettings(newSettings);
    setMessage({ type: '', text: '' });
    setSavingKey(key);

    try {
      await user.updateNotificationSettings(newSettings);
      lastSavedSettings.current = newSettings;
      setMessage({ type: 'success', text: 'Settings saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      // Revert to previous state on error
      setSettings({ ...settings, [key]: previousValue });
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save settings. Please try again.' 
      });
    } finally {
      setSavingKey(null);
    }
  };

  const ToggleSwitch = ({ 
    settingKey, 
    label, 
    description 
  }: { 
    settingKey: keyof NotificationSettingsState; 
    label: string; 
    description: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1 pr-4">
        <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        disabled={savingKey !== null}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          settings[settingKey] ? 'bg-sage-500' : 'bg-gray-300 dark:bg-gray-600'
        } disabled:opacity-50`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[settingKey] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        {savingKey === settingKey && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin rounded-full h-3 w-3 border-b border-white"></span>
          </span>
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <ToggleSwitch
          settingKey="emailNotifications"
          label="Email Notifications"
          description="Receive updates and reminders via email"
        />
        
        <ToggleSwitch
          settingKey="pushNotifications"
          label="Push Notifications"
          description="Get browser push notifications"
        />
        
        <ToggleSwitch
          settingKey="weeklyReport"
          label="Weekly Summary Report"
          description="Receive a weekly summary of your health data every Sunday"
        />
        
        <ToggleSwitch
          settingKey="appointmentReminders"
          label="Appointment Reminders"
          description="Get reminded about upcoming appointments"
        />
        
        <ToggleSwitch
          settingKey="medicationReminders"
          label="Medication Reminders"
          description="Never miss your medication schedule"
        />
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Note: Email notifications require a verified email address. Push notifications require browser permission.
      </p>
    </div>
  );
}
