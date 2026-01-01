'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Moon, Sunrise, X, Sparkles } from 'lucide-react'

interface ReflectionModalProps {
  completedTasks: any[]
  onClose: () => void
  onComplete: () => void
}

function ReflectionModal({ completedTasks, onClose, onComplete }: ReflectionModalProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [wentWell, setWentWell] = useState('')
  const [wouldChange, setWouldChange] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const ratingEmojis = [
    { value: 1, emoji: '😞', label: 'Rough' },
    { value: 2, emoji: '😕', label: 'Meh' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' },
  ]

  const handleSave = async () => {
    if (!rating) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      await supabase.from('daily_reflections').upsert({
        user_id: user.id,
        reflection_date: today,
        rating,
        went_well: wentWell || null,
        would_change: wouldChange || null,
      } as never)

      onComplete()
      onClose()
    } catch (error) {
      console.error('Error saving reflection:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-ocean-600" />
            <h2 className="text-2xl font-bold text-text-primary">Today's Reflection</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && (
          <div className="mb-6 p-4 bg-ocean-50 rounded-xl border border-ocean-200">
            <p className="text-sm font-semibold text-text-primary mb-2">
              ✨ You completed {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} today
            </p>
            <ul className="text-sm text-text-secondary space-y-1">
              {completedTasks.slice(0, 3).map((task) => (
                <li key={task.id} className="truncate">• {task.title}</li>
              ))}
              {completedTasks.length > 3 && (
                <li className="text-text-muted">+ {completedTasks.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Rating */}
        <div className="mb-6">
          <label className="label mb-3">How did today go?</label>
          <div className="flex justify-between gap-2">
            {ratingEmojis.map(({ value, emoji, label }) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  rating === value
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-surface-border hover:border-ocean-300'
                }`}
              >
                <div className="text-3xl mb-1">{emoji}</div>
                <div className="text-xs text-text-secondary">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* What went well */}
        <div className="mb-4">
          <label className="label">What's one thing that went well?</label>
          <textarea
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            className="input resize-none"
            rows={2}
            placeholder="Even small wins count..."
          />
        </div>

        {/* What to change */}
        <div className="mb-6">
          <label className="label">What would you change tomorrow?</label>
          <textarea
            value={wouldChange}
            onChange={(e) => setWouldChange(e.target.value)}
            className="input resize-none"
            rows={2}
            placeholder="One adjustment to make tomorrow better..."
          />
        </div>

        {/* Educational note */}
        <div className="mb-6 p-3 bg-sunset-50 rounded-lg border border-sunset-200">
          <p className="text-xs text-text-secondary">
            💡 <strong>Why reflect?</strong> Daily reflection helps your brain process the day, celebrate progress, and adjust course—especially valuable for minds that move fast and forget easily.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={!rating || saving}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EveningCues() {
  const [showPlanningCue, setShowPlanningCue] = useState(false)
  const [showReflectionCue, setShowReflectionCue] = useState(false)
  const [showReflectionModal, setShowReflectionModal] = useState(false)
  const [completedTasksToday, setCompletedTasksToday] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkCues()
    fetchCompletedTasks()
  }, [])

  const checkCues = () => {
    const hour = new Date().getHours()
    const today = new Date().toISOString().split('T')[0]

    // Check planning cue (after 6pm)
    if (hour >= 18) {
      const planningDismissed = localStorage.getItem(`planning_dismissed_${today}`)
      setShowPlanningCue(!planningDismissed)
    }

    // Check reflection cue (after 8pm)
    if (hour >= 20) {
      const reflectionDismissed = localStorage.getItem(`reflection_dismissed_${today}`)
      setShowReflectionCue(!reflectionDismissed)
    }
  }

  const fetchCompletedTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)

    setCompletedTasksToday(data || [])
  }

  const dismissPlanningCue = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`planning_dismissed_${today}`, 'true')
    setShowPlanningCue(false)
  }

  const dismissReflectionCue = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`reflection_dismissed_${today}`, 'true')
    setShowReflectionCue(false)
  }

  const handlePlanningClick = () => {
    dismissPlanningCue()
    router.push('/tasks')
  }

  const handleReflectionClick = () => {
    setShowReflectionModal(true)
  }

  const handleReflectionComplete = () => {
    dismissReflectionCue()
  }

  if (!showPlanningCue && !showReflectionCue) return null

  return (
    <>
      <div className="space-y-3 mb-6">
        {/* Planning Cue */}
        {showPlanningCue && (
          <div className="bg-gradient-to-br from-ocean-50 to-white border-2 border-ocean-200 rounded-2xl p-4 shadow-md animate-slide-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                <Sunrise className="w-6 h-6 text-ocean-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-primary mb-1">Evening Planning</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Want to plan tomorrow realistically?
                </p>
                <p className="text-xs text-text-muted mb-3">
                  💡 <strong>Why plan ahead?</strong> Evening planning prevents chaotic mornings and helps you wake up with clarity instead of overwhelm.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePlanningClick}
                    className="text-sm font-semibold text-ocean-600 hover:text-ocean-700 underline"
                  >
                    Plan Tomorrow
                  </button>
                  <button
                    onClick={dismissPlanningCue}
                    className="text-sm text-text-muted hover:text-text-secondary"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={dismissPlanningCue}
                className="flex-shrink-0 text-text-muted hover:text-text-secondary p-1 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Reflection Cue */}
        {showReflectionCue && (
          <div className="bg-gradient-to-br from-sunset-50 to-white border-2 border-sunset-200 rounded-2xl p-4 shadow-md animate-slide-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sunset-100 rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-sunset-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-primary mb-1">Evening Reflection</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Want to reflect on today?
                </p>
                <p className="text-xs text-text-muted mb-3">
                  💡 <strong>Why reflect?</strong> Reflection helps you celebrate wins (even tiny ones) and learn what to adjust—essential for brains that move fast.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReflectionClick}
                    className="text-sm font-semibold text-sunset-600 hover:text-sunset-700 underline"
                  >
                    Reflect on Today
                  </button>
                  <button
                    onClick={dismissReflectionCue}
                    className="text-sm text-text-muted hover:text-text-secondary"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={dismissReflectionCue}
                className="flex-shrink-0 text-text-muted hover:text-text-secondary p-1 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      {showReflectionModal && (
        <ReflectionModal
          completedTasks={completedTasksToday}
          onClose={() => setShowReflectionModal(false)}
          onComplete={handleReflectionComplete}
        />
      )}
    </>
  )
}
