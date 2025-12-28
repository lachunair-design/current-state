import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Current State - Work with your energy, not against it',
  description: 'The productivity app for humans with fluctuating everything. Energy-aware task matching for multi-income professionals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
