import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import ToastContainer from '@/components/Toast'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thrive PCOS - Empowering Women with PCOS',
  description: 'Track your PCOS symptoms, mood, and health journey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-200`}>
        <Providers>
          <div className="pb-16 sm:pb-0">
            {children}
          </div>
          <ToastContainer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
