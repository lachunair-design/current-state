'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, X } from 'lucide-react'

interface WeeklyPlanningCueProps {
  hasPlanThisWeek: boolean
}

export function WeeklyPlanningCue({ hasPlanThisWeek }: WeeklyPlanningCueProps) {
  const [showCue, setShowCue] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Only show on Sunday (0) or Monday (1)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const isWeekendOrMonday = dayOfWeek === 0 || dayOfWeek === 1

    // Get Monday of current week for localStorage key
    const monday = new Date(today)
    const diff = monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1)
    monday.setDate(diff)
    const weekKey = monday.toISOString().split('T')[0]

    const dismissedKey = `planning_dismissed_${weekKey}`
    const wasDismissed = localStorage.getItem(dismissedKey)

    // Show cue if:
    // 1. It's Sunday or Monday
    // 2. User hasn't planned this week
    // 3. User hasn't dismissed the cue this week
    if (isWeekendOrMonday && !hasPlanThisWeek && !wasDismissed) {
      setShowCue(true)
    }
  }, [hasPlanThisWeek])

  const handleDismiss = () => {
    const today = new Date()
    const monday = new Date(today)
    const diff = monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1)
    monday.setDate(diff)
    const weekKey = monday.toISOString().split('T')[0]

    localStorage.setItem(`planning_dismissed_${weekKey}`, 'true')
    setDismissed(true)
    setShowCue(false)
  }

  const handlePlan = () => {
    router.push('/planning')
  }

  if (!showCue || dismissed) return null

  return (
    <div className="mb-6 bg-gradient-to-br from-primary/10 to-pastel-blue/10 border-2 border-primary/30 rounded-2xl p-5 shadow-md animate-slide-in">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary mb-1 flex items-center gap-2">
            <span>Time to plan your week!</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
              {new Date().getDay() === 0 ? 'Sunday Ritual' : 'Monday Ritual'}
            </span>
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Take 5 minutes to set your focus goals and realistic capacity for the week ahead.
          </p>
          <p className="text-xs text-text-muted mb-3">
            💡 <strong>Why plan weekly?</strong> It prevents Monday overwhelm, helps you say no to distractions, and keeps you focused on what actually matters.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePlan}
              className="text-sm font-semibold text-primary hover:text-primary/80 underline"
            >
              Plan Your Week
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
