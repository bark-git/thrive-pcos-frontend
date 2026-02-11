import type { Metadata } from 'next'
import { Lora, Work_Sans } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import ToastContainer from '@/components/Toast'
import BottomNav from '@/components/BottomNav'

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const workSans = Work_Sans({ 
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Flourish - The Holistic PCOS Companion',
  description: 'Track your PCOS symptoms, mood, and health journey with whole-person wellness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${lora.variable} ${workSans.variable}`}>
      <body className="font-work bg-ivory dark:bg-forest-900 min-h-screen transition-colors duration-200">
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
