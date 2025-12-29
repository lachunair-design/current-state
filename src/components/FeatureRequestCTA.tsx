'use client'

import Link from 'next/link'
import { Lightbulb } from 'lucide-react'

export function FeatureRequestCTA() {
  return (
    <Link
      href="/profile#feature-request"
      className="block mb-6 bg-gradient-to-br from-accent-amber/10 to-transparent border border-accent-amber/30 rounded-2xl p-5 hover:border-accent-amber/50 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Lightbulb className="w-6 h-6 text-accent-amber" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary group-hover:text-accent-amber transition-colors">
            Have an idea?
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Tell us what features would make Current State even better for you
          </p>
        </div>
      </div>
    </Link>
  )
}
