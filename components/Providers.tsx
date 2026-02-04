'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/ThemeContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
