'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '🏠', activeIcon: '🏠' },
  { href: '/mood', label: 'Mood', icon: '😊', activeIcon: '😊' },
  { href: '/symptoms', label: 'Symptoms', icon: '📋', activeIcon: '📋' },
  { href: '/cycles', label: 'Cycle', icon: '📅', activeIcon: '📅' },
  { href: '/profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages or onboarding
  if (pathname === '/' || pathname.startsWith('/auth') || pathname === '/onboarding') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:hidden z-40 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${
                isActive 
                  ? 'text-sage-600 dark:text-sage-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className={`text-xl mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-sage-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
