import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#4FB3D4',
}

export const metadata: Metadata = {
  title: 'Current State - Work with your energy, not against it',
  description: 'A capacity-aware planning system that helps you work sustainably, not constantly. Plan realistically and protect your energy.',
  keywords: ['productivity', 'energy management', 'task management', 'focus', 'goals', 'habits', 'time management', 'sustainable work', 'capacity planning'],
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
    description: 'A capacity-aware planning system. Plan realistically, protect your energy, and make progress without burnout.',
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
    description: 'A capacity-aware planning system for sustainable productivity.',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen page-gradient antialiased relative overflow-x-hidden font-display">
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
