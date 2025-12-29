'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sunset-50 via-bg-primary to-ocean-50 text-text-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-accent-ocean mb-4">404</h1>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h2>
          <p className="text-text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white border border-surface-border rounded-lg font-medium text-text-primary hover:border-accent-ocean/30 hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <p className="text-text-muted text-sm mt-8">
          Lost? Try checking your energy level first 😊
        </p>
      </div>
    </div>
  )
}
