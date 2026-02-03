'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, user } from '@/lib/api';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
import NotificationSettings from '@/components/NotificationSettings';
import PasswordChange from '@/components/PasswordChange';
import AccountStats from '@/components/AccountStats';
import DataExport from '@/components/DataExport';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header currentPage="profile" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 sm:px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 sm:px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 sm:px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === 'export'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              📥 Export
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 sm:px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Stats
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <PasswordChange />}
          {activeTab === 'export' && <DataExport />}
          {activeTab === 'stats' && <AccountStats />}
        </div>
      </main>
    </div>
  );
}
