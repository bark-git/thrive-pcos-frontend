'use client';

import { useState, useEffect } from 'react';
import { user } from '@/lib/api';
import api from '@/lib/api';
import { format } from 'date-fns';

const TIMEZONES = [
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'America/Denver', label: 'Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'UTC', label: 'UTC' },
];

const PRIMARY_CONCERNS = [
  { id: 'irregular_periods', label: 'Irregular periods' },
  { id: 'fertility', label: 'Fertility / TTC' },
  { id: 'weight', label: 'Weight management' },
  { id: 'acne', label: 'Acne / Skin issues' },
  { id: 'hair_loss', label: 'Hair loss' },
  { id: 'excess_hair', label: 'Excess hair growth' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'mood', label: 'Mood / Mental health' },
  { id: 'insulin_resistance', label: 'Insulin resistance' },
  { id: 'sleep', label: 'Sleep issues' },
];

const GOALS = [
  { id: 'track_symptoms', label: 'Track for doctor visits' },
  { id: 'understand_patterns', label: 'Understand patterns' },
  { id: 'improve_mental_health', label: 'Improve mental health' },
  { id: 'manage_weight', label: 'Manage weight' },
  { id: 'prepare_pregnancy', label: 'Prepare for pregnancy' },
  { id: 'reduce_symptoms', label: 'Reduce symptoms' },
  { id: 'medication_tracking', label: 'Track medications' },
  { id: 'cycle_prediction', label: 'Predict cycles' },
];

const PHENOTYPE_INFO: Record<string, { name: string; description: string }> = {
  'A': { name: 'Type A (Classic)', description: 'Irregular periods + high androgens + polycystic ovaries' },
  'B': { name: 'Type B (Non-PCO)', description: 'Irregular periods + high androgens' },
  'C': { name: 'Type C (Ovulatory)', description: 'Regular periods + high androgens + polycystic ovaries' },
  'D': { name: 'Type D (Non-Hyperandrogenic)', description: 'Irregular periods + polycystic ovaries' },
};

const DIAGNOSIS_STATUS: Record<string, string> = {
  'CONFIRMED': 'Confirmed diagnosis',
  'SUSPECTED': 'Suspected / Self-diagnosed',
  'UNSURE': 'Not sure yet'
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    timezone: 'UTC',
    diagnosisDate: '',
    diagnosisStatus: '',
    phenotype: '',
    primaryConcerns: [] as string[],
    goals: [] as string[]
  });

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
        timezone: profileData.timezone || 'UTC',
        diagnosisDate: profileData.profile?.diagnosisDate 
          ? format(new Date(profileData.profile.diagnosisDate), 'yyyy-MM-dd') 
          : '',
        diagnosisStatus: profileData.profile?.diagnosisStatus || 'UNSURE',
        phenotype: profileData.profile?.phenotype || '',
        primaryConcerns: profileData.profile?.primaryConcerns || [],
        goals: profileData.profile?.goals || []
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      if (section === 'personal') {
        await user.updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          timezone: formData.timezone
        });
      } else {
        // Save PCOS data
        await api.post('/auth/complete-onboarding', {
          diagnosisStatus: formData.diagnosisStatus,
          diagnosisDate: formData.diagnosisDate || undefined,
          phenotype: formData.phenotype || undefined,
          primaryConcerns: formData.primaryConcerns,
          goals: formData.goals
        });
      }

      setMessage({ type: 'success', text: 'Saved successfully!' });
      await loadProfile();
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      dateOfBirth: profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), 'yyyy-MM-dd') : '',
      timezone: profile?.timezone || 'UTC',
      diagnosisDate: profile?.profile?.diagnosisDate ? format(new Date(profile.profile.diagnosisDate), 'yyyy-MM-dd') : '',
      diagnosisStatus: profile?.profile?.diagnosisStatus || 'UNSURE',
      phenotype: profile?.profile?.phenotype || '',
      primaryConcerns: profile?.profile?.primaryConcerns || [],
      goals: profile?.profile?.goals || []
    });
    setEditingSection(null);
    setMessage({ type: '', text: '' });
  };

  const toggleConcern = (id: string) => {
    setFormData(prev => ({
      ...prev,
      primaryConcerns: prev.primaryConcerns.includes(id)
        ? prev.primaryConcerns.filter(c => c !== id)
        : [...prev.primaryConcerns, id]
    }));
  };

  const toggleGoal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id]
    }));
  };

  const getConcernLabels = (ids: string[]) => {
    return ids.map(id => PRIMARY_CONCERNS.find(c => c.id === id)?.label || id).join(', ');
  };

  const getGoalLabels = (ids: string[]) => {
    return ids.map(id => GOALS.find(g => g.id === id)?.label || id).join(', ');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Personal Information Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
          {editingSection !== 'personal' && (
            <button
              onClick={() => setEditingSection('personal')}
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          {editingSection === 'personal' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSaveSection('personal')}
                  disabled={saving}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Email</span>
                <span className="text-gray-900 dark:text-white">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Name</span>
                <span className="text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Date of Birth</span>
                <span className="text-gray-900 dark:text-white">{formData.dateOfBirth || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Timezone</span>
                <span className="text-gray-900 dark:text-white">
                  {TIMEZONES.find(tz => tz.value === formData.timezone)?.label || formData.timezone}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PCOS Diagnosis Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-pink-50 dark:bg-pink-900/30 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-pink-800 dark:text-pink-300">PCOS Diagnosis</h3>
          {editingSection !== 'diagnosis' && (
            <button
              onClick={() => setEditingSection('diagnosis')}
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          {editingSection === 'diagnosis' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnosis Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DIAGNOSIS_STATUS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, diagnosisStatus: value })}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        formData.diagnosisStatus === value
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-pink-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.diagnosisStatus === 'CONFIRMED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis Date</label>
                  <input
                    type="date"
                    value={formData.diagnosisDate}
                    onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PCOS Phenotype</label>
                <div className="space-y-2">
                  {Object.entries(PHENOTYPE_INFO).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, phenotype: key })}
                      className={`w-full p-3 rounded-lg border-2 text-left transition ${
                        formData.phenotype === key
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{info.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{info.description}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, phenotype: '' })}
                    className={`w-full p-3 rounded-lg border-2 text-left transition ${
                      !formData.phenotype ? 'border-gray-400 bg-gray-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-600 dark:text-gray-400">Not sure / Not set</div>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSaveSection('diagnosis')}
                  disabled={saving}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className="text-gray-900 dark:text-white">{DIAGNOSIS_STATUS[formData.diagnosisStatus] || 'Not set'}</span>
              </div>
              {formData.diagnosisStatus === 'CONFIRMED' && (
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Diagnosis Date</span>
                  <span className="text-gray-900 dark:text-white">{formData.diagnosisDate || 'Not set'}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Phenotype</span>
                <span className="text-gray-900 dark:text-white">
                  {formData.phenotype ? PHENOTYPE_INFO[formData.phenotype]?.name : 'Not set'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Concerns & Goals Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/30 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Concerns & Goals</h3>
          {editingSection !== 'concerns' && (
            <button
              onClick={() => setEditingSection('concerns')}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          {editingSection === 'concerns' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Primary Concerns ({formData.primaryConcerns.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRIMARY_CONCERNS.map(concern => (
                    <button
                      key={concern.id}
                      type="button"
                      onClick={() => toggleConcern(concern.id)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition ${
                        formData.primaryConcerns.includes(concern.id)
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-pink-300'
                      }`}
                    >
                      {concern.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Goals ({formData.goals.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(goal => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition ${
                        formData.goals.includes(goal.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSaveSection('concerns')}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block mb-1">Primary Concerns</span>
                <span className="text-gray-900 dark:text-white">
                  {formData.primaryConcerns.length > 0 
                    ? getConcernLabels(formData.primaryConcerns) 
                    : 'None selected'}
                </span>
              </div>
              <div className="py-2">
                <span className="text-gray-500 dark:text-gray-400 block mb-1">Goals</span>
                <span className="text-gray-900 dark:text-white">
                  {formData.goals.length > 0 
                    ? getGoalLabels(formData.goals) 
                    : 'None selected'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
