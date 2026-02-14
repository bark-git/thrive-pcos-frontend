'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ErrorBoundary>
  );
}
