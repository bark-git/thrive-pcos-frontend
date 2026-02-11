'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import OnboardingWizard from '@/components/OnboardingWizard';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState(auth.getUser());

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleComplete = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-sage-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return <OnboardingWizard onComplete={handleComplete} />;
}
