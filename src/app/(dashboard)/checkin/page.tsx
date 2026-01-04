'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react'
import {
  Task,
  Goal,
  ENERGY_LEVEL_CONFIG,
  WORK_TYPE_CONFIG,
  TIME_ESTIMATE_CONFIG,
  PRIORITY_CONFIG,
} from '@/types/database'
import { useCelebration } from '@/components/Celebration'
import clsx from 'clsx'

interface TaskWithGoal extends Task {
  goals?: Goal
}

interface MatchedTask {
  task: TaskWithGoal
  score: number
  reasons: string[]
}

type MetricKey = 'energy_level' | 'mental_clarity' | 'emotional_state' | 'available_time' | 'environment_quality'

const METRICS = [
  {
    key: 'energy_level' as MetricKey,
    label: 'Physical Battery',
    icon: 'battery_charging_full',
    color: 'text-emerald-600 dark:text-emerald-400',
    lowLabel: 'Depleted',
    highLabel: 'Charged',
  },
  {
    key: 'mental_clarity' as MetricKey,
    label: 'Mental Clarity',
    icon: 'wb_sunny',
    color: 'text-cyan-600 dark:text-cyan-400',
    lowLabel: 'Foggy',
    highLabel: 'Finding Focus',
  },
  {
    key: 'emotional_state' as MetricKey,
    label: 'Emotional State',
    icon: 'balance',
    color: 'text-rose-500 dark:text-rose-400',
    lowLabel: 'Low',
    midLabel: 'Balanced',
    highLabel: 'High',
  },
  {
    key: 'available_time' as MetricKey,
    label: 'Creative Spark',
    icon: 'lightbulb',
    color: 'text-amber-500 dark:text-amber-400',
    lowLabel: 'Dull',
    highLabel: 'Blazing',
  },
  {
    key: 'environment_quality' as MetricKey,
    label: 'Pressure Valve',
    icon: 'compress',
    color: 'text-indigo-500 dark:text-indigo-400',
    lowLabel: 'Calm',
    highLabel: 'Overload',
  },
]

export default function CheckinPage() {
  const [step, setStep] = useState(0)
  const [responses, setResponses] = useState<Record<MetricKey, number>>({
    energy_level: 3,
    mental_clarity: 3,
    emotional_state: 3,
    available_time: 3,
    environment_quality: 3,
  })
  const [loading, setLoading] = useState(false)
  const [matchedTasks, setMatchedTasks] = useState<MatchedTask[]>([])
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [committing, setCommitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  const handleResponse = (key: MetricKey, value: number) => {
    setResponses({ ...responses, [key]: value })
  }

  const getPercentage = (value: number): number => {
    return value * 20
  }

  const matchTasks = (tasks: TaskWithGoal[], state: Record<string, number>): MatchedTask[] => {
    const compositeScore = (
      state.energy_level + state.mental_clarity + state.emotional_state +
      state.available_time + state.environment_quality
    ) / 5

    const scoredTasks = tasks.map(task => {
      let score = 0
      const reasons: string[] = []

      if (task.priority === 'must_do') {
        score += 1000
        reasons.push('Must do today — non-negotiable')
      }

      const energyMatch = {
        low: state.energy_level <= 2,
        medium: state.energy_level === 3,
        high: state.energy_level >= 4,
      }

      if (task.energy_required === 'low' && energyMatch.low) {
        score += 30
        reasons.push('Low energy task, perfect for right now')
      } else if (task.energy_required === 'medium' && energyMatch.medium) {
        score += 25
        reasons.push('Medium energy match')
      } else if (task.energy_required === 'high' && energyMatch.high) {
        score += 30
        reasons.push('High energy match — ride this wave')
      }

      const timeMatch = {
        tiny: state.available_time <= 2,
        short: state.available_time === 3,
        medium: state.available_time === 4,
        long: state.available_time >= 4,
      }

      if (task.time_estimate === 'tiny' && timeMatch.tiny) {
        score += 20
        reasons.push('Quick win available')
      } else if (task.time_estimate === 'short' && (timeMatch.short || timeMatch.medium)) {
        score += 15
      } else if (task.time_estimate === 'medium' && timeMatch.long) {
        score += 15
      }

      if (state.mental_clarity >= 4 && task.work_type === 'deep_work') {
        score += 25
        reasons.push('Sharp focus for deep work')
      } else if (state.mental_clarity <= 2 && task.work_type === 'light_lift') {
        score += 20
        reasons.push('Light task for current mental state')
      }

      if (task.priority === 'should_do') score += 10
      if (task.priority === 'could_do') score += 5

      if (task.estimated_value && task.estimated_value > 100) {
        score += 15
        reasons.push(`High value: $${task.estimated_value}`)
      }

      return { task, score, reasons }
    })

    return scoredTasks.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const compositeScore = (
        responses.energy_level + responses.mental_clarity + responses.emotional_state +
        responses.available_time + responses.environment_quality
      ) / 5

      const { error: responseError } = await supabase.from('daily_responses').insert({
        user_id: user.id,
        energy_level: responses.energy_level,
        mental_clarity: responses.mental_clarity,
        emotional_state: responses.emotional_state,
        available_time: responses.available_time,
        environment_quality: responses.environment_quality,
        composite_score: compositeScore,
      } as never)

      if (responseError) throw responseError

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, goals(*)')
        .eq('user_id', user.id)
        .in('status', ['active', 'deferred'])

      if (tasks && tasks.length > 0) {
        const matched = matchTasks(tasks as TaskWithGoal[], responses)
        setMatchedTasks(matched)
      }

      setStep(1)
    } catch (err) {
      console.error('Check-in error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskAction = async (taskId: string, action: 'completed' | 'deferred') => {
    setSubmitting(taskId)
    try {
      const matchedTask = matchedTasks.find(m => m.task.id === taskId)

      if (action === 'completed') {
        await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() } as never).eq('id', taskId)

        if (matchedTask) {
          celebrate(`You completed "${matchedTask.task.title}"! Keep building momentum! 💪`)
        }
      } else {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        await supabase.from('tasks').update({ deferred_until: tomorrow.toISOString().split('T')[0] } as never).eq('id', taskId)
      }
      setMatchedTasks(matchedTasks.filter(m => m.task.id !== taskId))
    } finally {
      setSubmitting(null)
    }
  }

  const handleCommitToFocus = async () => {
    setCommitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      const commitments = matchedTasks.map(({ task }) => ({
        user_id: user.id,
        task_id: task.id,
        commitment_date: today,
      }))

      const { error } = await supabase
        .from('daily_commitments')
        .upsert(commitments as never)

      if (error) {
        console.error('Error creating commitments:', error)
        return
      }

      celebrate(`Committed to ${matchedTasks.length} task${matchedTasks.length > 1 ? 's' : ''} for today! Let's make it happen! 🎯`)

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Error committing to focus:', error)
    } finally {
      setCommitting(false)
    }
  }

  const resetCheckin = () => {
    setStep(0)
    setResponses({
      energy_level: 3,
      mental_clarity: 3,
      emotional_state: 3,
      available_time: 3,
      environment_quality: 3,
    })
    setMatchedTasks([])
  }

  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 bg-[#faf9f6] dark:bg-zinc-900 transition-colors duration-500">
        {/* Background blur effects */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-50 dark:opacity-20 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-stone-200 dark:bg-stone-800 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-200 dark:bg-slate-800 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        <div className="w-full max-w-[680px] bg-white dark:bg-zinc-800/40 p-8 md:p-14 rounded-[2rem] shadow-sm border border-stone-100 dark:border-stone-800 relative overflow-hidden backdrop-blur-sm z-10">
          {/* Top right blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-stone-100 dark:bg-stone-800 rounded-full blur-[80px] -z-10 opacity-60 pointer-events-none"></div>

          {/* Header */}
          <header className="flex justify-between items-center mb-12 md:mb-16">
            <button
              onClick={() => router.back()}
              className="group flex items-center justify-center w-10 h-10 -ml-2 text-gray-500 dark:text-gray-400 hover:text-[#1c1c1e] dark:hover:text-white transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-white/5"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </button>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-gray-400 opacity-70">
              Daily Check-in
            </span>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#1c1c1e] dark:hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/5"
            >
              Skip
            </button>
          </header>

          {/* Title */}
          <div className="text-center mb-14 md:mb-20">
            <h1 className="font-serif text-4xl md:text-5xl font-medium leading-[1.15] text-[#1c1c1e] dark:text-white mb-6">
              How is your energy <br className="hidden md:block" />
              <span className="italic font-normal text-stone-500 dark:text-stone-400">unfolding</span> today?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-[15px] max-w-md mx-auto leading-relaxed opacity-80">
              Take a moment to tune in. Use the sliders below to capture your current state.
            </p>
          </div>

          {/* Sliders */}
          <form className="space-y-14 md:space-y-16">
            {METRICS.map((metric) => (
              <div key={metric.key} className="relative group">
                <div className="flex justify-between items-end mb-5 px-1">
                  <label className="flex items-center gap-3 text-lg font-medium text-gray-900 dark:text-gray-100 font-serif">
                    <span className={`material-symbols-outlined text-[22px] ${metric.color} opacity-90`}>
                      {metric.icon}
                    </span>
                    {metric.label}
                  </label>
                  {metric.key === 'energy_level' && (
                    <span className="text-xl font-serif font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {getPercentage(responses[metric.key])}%
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={responses[metric.key]}
                  onChange={(e) => handleResponse(metric.key, parseInt(e.target.value))}
                  className={`w-full h-1 rounded-full appearance-none cursor-pointer ${metric.color.replace('text-', 'accent-')}`}
                  style={{
                    background: `linear-gradient(to right, currentColor 0%, currentColor ${(responses[metric.key] - 1) * 25}%, #e5e7eb ${(responses[metric.key] - 1) * 25}%, #e5e7eb 100%)`
                  }}
                />
                <div className={`flex justify-between mt-3 text-[11px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 opacity-50 px-1 ${metric.midLabel ? 'relative' : ''}`}>
                  <span>{metric.lowLabel}</span>
                  {metric.midLabel && (
                    <span className="absolute left-1/2 -translate-x-1/2">{metric.midLabel}</span>
                  )}
                  <span>{metric.highLabel}</span>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-10 md:pt-14">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#1c1c1e] text-white hover:bg-black dark:hover:bg-stone-200 dark:hover:text-[#1c1c1e] transition-all duration-300 py-4 md:py-5 rounded-xl font-medium text-lg shadow-xl shadow-stone-200/50 dark:shadow-none flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Log Check-in</span>
                    <span className="material-symbols-outlined text-xl relative z-10 group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Results page (keeping existing logic but could be redesigned too)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br bg-accent-ocean/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-8 h-8 text-accent-ocean" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Here's what matches your state</h1>
        <p className="text-lg text-text-secondary">The app chose these for you—no decisions needed.</p>
      </div>

      <div className="bg-white border border-surface-border rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <div className="text-2xl flex-shrink-0">🧭</div>
          <div className="text-sm text-text-primary">
            <p className="font-semibold mb-1">How this app works:</p>
            <p>Check-ins guide you. The Tasks page is just a parking lot for later. Let your energy lead.</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8 flex items-center justify-between shadow-md hover:shadow-lg transition-all animate-slide-in">
        <div className="flex items-center gap-5">
          <div className="text-4xl">
            {responses.energy_level <= 2 ? '😴' : responses.energy_level <= 4 ? '😊' : '⚡'}
          </div>
          <div>
            <div className="text-sm font-medium text-text-muted uppercase tracking-wide">Your current state</div>
            <div className="font-semibold text-text-primary text-lg mt-1">
              {responses.energy_level <= 2 ? 'Low energy - taking it easy' :
               responses.energy_level <= 4 ? 'Good energy - ready to work' : 'High energy - lets go!'}
            </div>
          </div>
        </div>
        <button
          onClick={resetCheckin}
          className="text-sm text-text-muted hover:text-text-secondary flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Redo
        </button>
      </div>

      {matchedTasks.length > 0 && (
        <div className="mb-6 animate-slide-in">
          <button
            onClick={handleCommitToFocus}
            disabled={committing}
            className="w-full bg-gradient-to-r from-primary to-pastel-blue-dark hover:from-primary/90 hover:to-pastel-blue-dark/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {committing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Committing to your focus...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Commit to Today's Focus</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-center text-sm text-text-muted mt-2">
            Make this your plan for today—track progress on your dashboard
          </p>
        </div>
      )}

      {matchedTasks.length > 0 ? (
        <div className="space-y-5">
          {matchedTasks.map(({ task, reasons }, index) => {
            const energyConfig = ENERGY_LEVEL_CONFIG[task.energy_required]
            const workTypeConfig = WORK_TYPE_CONFIG[task.work_type]
            const timeConfig = TIME_ESTIMATE_CONFIG[task.time_estimate]
            const priorityConfig = PRIORITY_CONFIG[task.priority]

            return (
              <div
                key={task.id}
                className={clsx(
                  'card p-7 transition-all hover:shadow-xl',
                  index === 0 && 'ring-2 ring-primary-500 ring-offset-2 shadow-lg bg-gradient-to-br from-white to-primary-50/30'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {index === 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs font-bold text-accent-ocean bg-primary-100 px-3 py-1 rounded-full uppercase tracking-wide">
                      ⭐ Top Match
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary text-xl mb-1">{task.title}</h3>
                    {task.goals && (
                      <p className="text-sm text-text-muted font-medium">
                        <span className="text-accent-ocean">→</span> {task.goals.title}
                      </p>
                    )}
                  </div>
                  {task.estimated_value && (
                    <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                      💰 ${task.estimated_value}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${energyConfig.color}`}>
                    {energyConfig.label}
                  </span>
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-hover text-text-secondary">
                    {workTypeConfig.icon} {workTypeConfig.label}
                  </span>
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-hover text-text-secondary">
                    ⏱️ {timeConfig.label}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                </div>

                {reasons.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
                    <div className="text-sm text-text-primary">
                      <span className="font-bold">Why this task:</span>
                      <span className="ml-2">{reasons.join(' • ')}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {responses.energy_level <= 2 ? (
                    <button
                      onClick={() => handleTaskAction(task.id, 'deferred')}
                      disabled={submitting === task.id}
                      className="btn-secondary flex-1 disabled:opacity-50"
                    >
                      {submitting === task.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        'Skip for now'
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleTaskAction(task.id, 'completed')}
                        disabled={submitting === task.id}
                        className="btn-primary flex-1 shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {submitting === task.id ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          <>
                            <Check className="w-5 h-5 inline mr-2" />
                            Mark Complete
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleTaskAction(task.id, 'deferred')}
                        disabled={submitting === task.id}
                        className="btn-secondary px-6 disabled:opacity-50"
                      >
                        Not today
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center shadow-md">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🎉</span>
          </div>
          <h3 className="font-bold text-text-primary text-2xl mb-2">All clear!</h3>
          <p className="text-text-secondary mb-6 text-lg">
            You're all caught up, or you haven't added tasks yet.
          </p>
          <button
            onClick={() => router.push('/tasks')}
            className="btn-primary inline-flex items-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined">checklist</span>
            Add some tasks
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={() => router.push('/dashboard')} className="text-text-muted hover:text-text-secondary">
          Back to dashboard
        </button>
      </div>

      {CelebrationComponent}
    </div>
  )
}
