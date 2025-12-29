import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Current State - Work with your energy, not against it',
  description: 'The productivity app for humans with fluctuating everything. Energy-aware task matching for multi-income professionals.',
  keywords: ['productivity', 'energy management', 'task management', 'ADHD', 'focus', 'goals', 'habits', 'time management'],
  authors: [{ name: 'Current State' }],
  creator: 'Current State',
  publisher: 'Current State',
  metadataBase: new URL('https://currentstate.app'), // Update with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://currentstate.app',
    title: 'Current State - Work with your energy, not against it',
    description: 'Energy-aware productivity for multi-passionate professionals. Match tasks to your current state, not your to-do list.',
    siteName: 'Current State',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'Current State - Energy-aware productivity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Current State - Work with your energy, not against it',
    description: 'Energy-aware productivity for multi-passionate professionals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen page-gradient antialiased relative overflow-x-hidden">
        {/* Floating background shapes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="floating-shape" />
          <div className="floating-shape" />
          <div className="floating-shape" />
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
