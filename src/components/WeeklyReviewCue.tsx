'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, X } from 'lucide-react'

export function WeeklyReviewCue() {
  const [showCue, setShowCue] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Only show on Friday (5), Saturday (6), or Sunday (0)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0

    // Get Monday of current week for localStorage key
    const monday = new Date(today)
    const diff = monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1)
    monday.setDate(diff)
    const weekKey = monday.toISOString().split('T')[0]

    const dismissedKey = `review_dismissed_${weekKey}`
    const wasDismissed = localStorage.getItem(dismissedKey)

    // Show cue if:
    // 1. It's Friday, Saturday, or Sunday
    // 2. User hasn't dismissed the cue this week
    if (isWeekend && !wasDismissed) {
      setShowCue(true)
    }
  }, [])

  const handleDismiss = () => {
    const today = new Date()
    const monday = new Date(today)
    const diff = monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1)
    monday.setDate(diff)
    const weekKey = monday.toISOString().split('T')[0]

    localStorage.setItem(`review_dismissed_${weekKey}`, 'true')
    setDismissed(true)
    setShowCue(false)
  }

  const handleReview = () => {
    router.push('/review')
  }

  if (!showCue || dismissed) return null

  return (
    <div className="mb-6 bg-gradient-to-br from-sunset-50 to-orange-50 border-2 border-sunset-300 rounded-2xl p-5 shadow-md animate-slide-in">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-sunset-100 rounded-xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-sunset-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary mb-1 flex items-center gap-2">
            <span>Review your week!</span>
            <span className="text-xs bg-sunset-200 text-sunset-800 px-2 py-0.5 rounded-full font-semibold">
              {new Date().getDay() === 5 ? 'Friday' : new Date().getDay() === 6 ? 'Saturday' : 'Sunday'}
            </span>
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Celebrate what you accomplished and learn from this week to plan better.
          </p>
          <p className="text-xs text-text-muted mb-3">
            💡 <strong>Why review?</strong> Weekly reviews help you see progress you'd otherwise miss, learn what's working, and reset for the week ahead with clarity.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleReview}
              className="text-sm font-semibold text-sunset-700 hover:text-sunset-800 underline"
            >
              Review This Week
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm text-text-muted hover:text-text-secondary"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-text-muted hover:text-text-secondary p-1 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
