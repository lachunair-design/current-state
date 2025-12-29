'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Timer, Play, Pause, X } from 'lucide-react'
import { Clock } from 'lucide-react'
import { WORK_TYPE_CONFIG, TIME_ESTIMATE_CONFIG, TimeEstimate, WorkType } from '@/types/database'
import { useCelebration } from '@/components/Celebration'

interface Task {
  id: string
  title: string
  time_estimate: string
  work_type: string
  goals?: {
    title: string
  }
}

interface TodaysFocusCardProps {
  task: Task
}

const TIMER_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
]

export function TodaysFocusCard({ task }: TodaysFocusCardProps) {
  const [showTimer, setShowTimer] = useState(false)
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completing, setCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            // Play notification sound or show alert
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Focus session complete!', {
                  body: 'Great work! Time for a break.',
                })
              }
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleCompleteTask = async () => {
    setCompleting(true)
    try {
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        } as never)
        .eq('id', task.id)

      celebrate(`You completed "${task.title}"! Keep up the great work! 💪`)
      router.refresh()
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompleting(false)
    }
  }

  const startTimer = (minutes: number) => {
    setSelectedMinutes(minutes)
    setTimeLeft(minutes * 60)
    setIsRunning(true)
    setShowTimer(true)

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedMinutes * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold font-semibold text-text-primary">Today's Focus</h3>
        </div>

        <div className="rounded-xl bg-dark-card border border-dark-border shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              {task.goals && (
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1">
                  {task.goals.title}
                </span>
              )}
              <h4 className="text-lg font-bold text-text-primary leading-snug">
                {task.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-dark-hover px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>{TIME_ESTIMATE_CONFIG[task.time_estimate as TimeEstimate]?.label || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-dark-hover px-2 py-1 rounded-md">
              <span>{WORK_TYPE_CONFIG[task.work_type as WorkType]?.icon || '📋'}</span>
              <span>{WORK_TYPE_CONFIG[task.work_type as WorkType]?.label || 'Task'}</span>
            </div>
          </div>

          {/* Timer Display */}
          {showTimer && (
            <div className="mb-4 p-4 bg-dark-hover rounded-lg border border-dark-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-secondary">Focus Timer</span>
                <button
                  onClick={() => setShowTimer(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mb-3">
                <div className="text-4xl font-bold font-semibold text-accent-green">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  className="flex-1 py-2 bg-accent-green hover:bg-primary-600 text-black font-medium rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {timeLeft === selectedMinutes * 60 ? 'Start' : 'Resume'}
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-dark-card border border-dark-border hover:bg-dark-hover text-text-secondary font-medium rounded-lg text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCompleteTask}
              disabled={completing}
              className="py-2.5 bg-dark-card border border-accent-green/30 hover:bg-accent-green/10 text-accent-green font-medium rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Check className="w-4 h-4" />
              {completing ? 'Completing...' : 'Mark Done'}
            </button>

            {!showTimer ? (
              <div className="relative group">
                <button
                  className="w-full py-2.5 bg-accent-green hover:bg-primary-600 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Timer className="w-4 h-4" />
                  Start Focus
                </button>
                {/* Timer preset dropdown */}
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-dark-card border border-dark-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {TIMER_PRESETS.map((preset) => (
                    <button
                      key={preset.minutes}
                      onClick={() => startTimer(preset.minutes)}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-dark-hover first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTimer(false)}
                className="py-2.5 bg-dark-card border border-dark-border hover:bg-dark-hover text-text-secondary font-medium rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
              >
                Hide Timer
              </button>
            )}
          </div>
        </div>
      </div>

      {CelebrationComponent}
    </>
  )
}
