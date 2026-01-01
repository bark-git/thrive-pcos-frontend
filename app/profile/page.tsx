'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, user } from '@/lib/api';
import ProfileForm from '@/components/ProfileForm';
import NotificationSettings from '@/components/NotificationSettings';
import PasswordChange from '@/components/PasswordChange';
import AccountStats from '@/components/AccountStats';

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
  }, []);

  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Thrive PCOS
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-pink-600 transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/symptoms')}
                  className="text-gray-600 hover:text-pink-600 transition"
                >
                  Symptoms
                </button>
                <button
                  onClick(() => router.push('/cycles')}
                  className="text-gray-600 hover:text-pink-600 transition"
                >
                  Cycles
                </button>
                <button className="text-pink-600 font-semibold">
                  Profile
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-pink-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h2>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'security'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'stats'
                  ? 'border-b-2 border-pink-500 text-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Account Stats
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <PasswordChange />}
          {activeTab === 'stats' && <AccountStats />}
        </div>
      </main>
    </div>
  );
}
