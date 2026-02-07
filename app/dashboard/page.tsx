'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, analytics } from '@/lib/api';
import Header from '@/components/Header';
import MoodForm from '@/components/MoodForm';
import MoodTrendChart from '@/components/MoodTrendChart';
import CorrelationCards from '@/components/CorrelationCards';
import InsightsPanel from '@/components/InsightsPanel';
import InsightsUnlockBanner from '@/components/InsightsUnlockBanner';
import MedicationStatusCard from '@/components/MedicationStatusCard';
import DashboardHero from '@/components/DashboardHero';
import QuickSymptomForm from '@/components/QuickSymptomForm';
import QuickPeriodForm from '@/components/QuickPeriodForm';
import CelebrationModal from '@/components/CelebrationModal';
import MonthlyCheckIn, { useMonthlyCheckIn } from '@/components/MonthlyCheckIn';
import { toast } from '@/components/Toast';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());
  const [loading, setLoading] = useState(true);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [showMonthlyCheckIn, setShowMonthlyCheckIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Monthly check-in hook
  const { isDue: monthlyCheckInDue, markComplete: markCheckInComplete, dismiss: dismissCheckIn } = useMonthlyCheckIn();
  
  // Celebration state
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: 'streak' | 'milestone' | 'first' | 'week';
    value?: number;
    message?: string;
  }>({ show: false, type: 'first' });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);
  
  // Show monthly check-in after initial load
  useEffect(() => {
    if (!loading && monthlyCheckInDue) {
      // Delay slightly so user sees dashboard first
      const timer = setTimeout(() => setShowMonthlyCheckIn(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, monthlyCheckInDue]);

  const loadData = async () => {
    // Just set loading false, all data is loaded by individual components
    setLoading(false);
  };

  const checkForCelebrations = async () => {
    try {
      const records = await analytics.getPersonalRecords();
      if (records.unlocked) {
        const { currentStreak, totalEntries } = records.stats;
        
        // First entry celebration
        if (totalEntries === 1) {
          setCelebration({ show: true, type: 'first' });
          return;
        }
        
        // Week milestone
        if (totalEntries === 7) {
          setCelebration({ show: true, type: 'week' });
          return;
        }
        
        // Streak milestones (7, 14, 21, 30, etc.)
        if ([7, 14, 21, 30, 50, 100].includes(currentStreak)) {
          setCelebration({ show: true, type: 'streak', value: currentStreak });
          return;
        }
        
        // Entry milestones
        if ([50, 100, 200, 365].includes(totalEntries)) {
          setCelebration({ show: true, type: 'milestone', value: totalEntries, message: `${totalEntries} Check-ins!` });
          return;
        }
      }
    } catch (err) {
      // Silent fail - celebrations are not critical
    }
  };

  const handleMoodSubmit = async () => {
    setShowMoodForm(false);
    toast.success('Mood logged!', 'Keep up the great work 💪');
    setRefreshKey(prev => prev + 1);
    checkForCelebrations();
  };

  const handleSymptomSubmit = async () => {
    setShowSymptomForm(false);
    toast.success('Symptom logged!', 'Tracking helps identify patterns');
    setRefreshKey(prev => prev + 1);
  };

  const handlePeriodSubmit = async () => {
    setShowPeriodForm(false);
    toast.success('Period logged!', 'Your predictions have been updated');
    setRefreshKey(prev => prev + 1);
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero + Medications Row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Hero Section - 2/3 on desktop */}
          <div className="lg:w-2/3">
            <DashboardHero 
              key={refreshKey}
              userName={user.firstName || 'there'}
              onQuickLogMood={() => setShowMoodForm(true)}
              onQuickLogSymptom={() => setShowSymptomForm(true)}
              onQuickLogPeriod={() => setShowPeriodForm(true)}
            />
          </div>
          
          {/* Medications Card - 1/3 on desktop */}
          <div className="lg:w-1/3">
            <MedicationStatusCard />
          </div>
        </div>

        {/* Insights Unlock Banner - shows when features are locked */}
        <InsightsUnlockBanner 
          key={`banner-${refreshKey}`}
          onLogMood={() => setShowMoodForm(true)}
          onLogSymptom={() => setShowSymptomForm(true)}
          onLogPeriod={() => setShowPeriodForm(true)}
        />

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Mood Trend Chart with Cycle Phase */}
          <MoodTrendChart key={`mood-${refreshKey}`} />
          
          {/* Correlation Cards */}
          <CorrelationCards key={`corr-${refreshKey}`} />
        </div>

        {/* Additional Insights */}
        <div className="mb-6">
          <InsightsPanel key={`insights-${refreshKey}`} />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a 
            href="/mood" 
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-3"
          >
            <span className="text-2xl">😊</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Mood History</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View all entries</p>
            </div>
          </a>
          <a 
            href="/symptoms" 
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-3"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Symptoms</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View & analyze</p>
            </div>
          </a>
          <a 
            href="/labs" 
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-3"
          >
            <span className="text-2xl">🔬</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Lab Results</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track trends</p>
            </div>
          </a>
          <a 
            href="/profile#export" 
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-3"
          >
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">For doctor visits</p>
            </div>
          </a>
        </div>
      </main>

      {/* Mood Form Modal */}
      {showMoodForm && (
        <MoodForm
          onClose={() => setShowMoodForm(false)}
          onSubmit={handleMoodSubmit}
        />
      )}

      {/* Quick Symptom Form Modal */}
      {showSymptomForm && (
        <QuickSymptomForm
          onClose={() => setShowSymptomForm(false)}
          onSubmit={handleSymptomSubmit}
        />
      )}

      {/* Quick Period Form Modal */}
      {showPeriodForm && (
        <QuickPeriodForm
          onClose={() => setShowPeriodForm(false)}
          onSubmit={handlePeriodSubmit}
        />
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebration.show}
        onClose={() => setCelebration(prev => ({ ...prev, show: false }))}
        type={celebration.type}
        value={celebration.value}
        message={celebration.message}
      />

      {/* Monthly Check-in Modal */}
      {showMonthlyCheckIn && (
        <MonthlyCheckIn
          onClose={() => {
            setShowMonthlyCheckIn(false);
            dismissCheckIn();
          }}
          onComplete={() => {
            setShowMonthlyCheckIn(false);
            markCheckInComplete();
            toast.success('Check-in complete!', 'Your concerns have been updated');
          }}
        />
      )}
    </div>
  );
}
