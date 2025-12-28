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
