'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Loader2, CheckSquare } from 'lucide-react'
import {
  QUESTIONNAIRE_QUESTIONS,
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
  const router = useRouter()
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  const handleResponse = (key: MetricKey, value: number) => {
    setResponses({ ...responses, [key]: value })
  }

  const getEnergyLabel = (value: number): string => {
    const percentage = value * 20
    if (percentage === 100) return '100%'
    if (percentage >= 80) return '90%'
    if (percentage >= 60) return '75%'
    if (percentage >= 40) return '50%'
    if (percentage >= 20) return '25%'
    return '10%'
  }

  const getClarityLabel = (value: number): string => {
    if (value >= 4) return 'Sharp'
    if (value >= 3) return 'Finding Focus'
    if (value === 2) return 'Hazy'
    return 'Foggy'
  }

  const getWeatherLabel = (value: number): string => {
    if (value >= 4) return 'Bright & Clear'
    if (value >= 3) return 'Clearing Up'
    if (value === 2) return 'Partly Cloudy'
    return 'Stormy'
  }

  const getStressLabel = (value: number): string => {
    if (value <= 2) return 'Zen'
    if (value === 3) return 'Manageable'
    if (value === 4) return 'Elevated'
    return 'Overload'
  }

  const getSparkLabel = (value: number): string => {
    if (value >= 4) return 'Blazing'
    if (value >= 3) return 'Ignited'
    if (value === 2) return 'Warming'
    return 'Dull'
  }

  const matchTasks = (tasks: TaskWithGoal[], state: Record<string, number>): MatchedTask[] => {
    const compositeScore = (
      state.energy_level + state.mental_clarity + state.emotional_state +
      state.available_time + state.environment_quality
    ) / 5

    return tasks
      .map(task => {
        let score = 0
        const reasons: string[] = []

        if (compositeScore < 2.5) {
          if (task.energy_required === 'low') {
            score += 40
            reasons.push('Perfect for your current energy level')
          } else if (task.energy_required === 'medium') {
            score += 15
          }
        } else if (compositeScore < 4) {
          if (task.energy_required === 'medium') {
            score += 40
            reasons.push('Matches your current capacity')
          } else if (task.energy_required === 'low') {
            score += 25
          } else {
            score += 15
          }
        } else {
          if (task.energy_required === 'high') {
            score += 40
            reasons.push('Great time for challenging work')
          } else if (task.energy_required === 'medium') {
            score += 25
          }
        }

        const timeMap: Record<string, number> = { tiny: 1, short: 2, medium: 3, long: 4, extended: 5 }
        const taskTime = timeMap[task.time_estimate] || 3
        if (state.available_time <= 2 && taskTime <= 2) {
          score += 25
          reasons.push('Fits your available time')
        } else if (state.available_time >= 4 && taskTime >= 3) {
          score += 20
          reasons.push('Good use of your time block')
        } else if (Math.abs(state.available_time - taskTime) <= 1) {
          score += 15
        }

        if (state.environment_quality >= 4 && task.work_type === 'deep_work') {
          score += 15
          reasons.push('Perfect environment for focus work')
        } else if (state.environment_quality <= 2 && task.work_type === 'admin') {
          score += 15
          reasons.push('Good for a distracting environment')
        }

        if (task.priority === 'must_do') {
          score += 10
          reasons.push('High priority task')
        } else if (task.priority === 'should_do') {
          score += 5
        }

        if (task.times_accepted > task.times_declined) {
          score += 10
        }

        if (task.estimated_value && task.estimated_value > 0) {
          score += 5
          reasons.push(`Worth $${task.estimated_value}`)
        }

        return { task, score, reasons }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  const submitCheckin = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('daily_responses').insert({
        user_id: user.id,
        energy_level: responses.energy_level,
        mental_clarity: responses.mental_clarity,
        emotional_state: responses.emotional_state,
        available_time: responses.available_time,
        environment_quality: responses.environment_quality,
      } as never)

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, goals(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')

      const matched = matchTasks(tasks || [], responses)
      setMatchedTasks(matched)

      await supabase.from('profiles').update({
        last_active_at: new Date().toISOString()
      } as never).eq('id', user.id)
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
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

    return (
      <div className="relative min-h-screen bg-bg-cream font-display text-text-main w-full lg:max-w-2xl mx-auto">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[500px] bg-gradient-to-br from-pastel-peach/20 via-bg-cream to-transparent opacity-60 blur-3xl rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[500px] bg-gradient-to-tl from-pastel-blue/10 via-pastel-sage/10 to-transparent opacity-60 blur-3xl rounded-full"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center p-6 pb-2 justify-between">
          <button
            onClick={() => router.back()}
            className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] opacity-80">Daily Rhythm</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex h-10 px-3 items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
          >
            <p className="text-text-muted text-sm font-bold leading-normal tracking-[0.015em]">Skip</p>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="px-6 pt-4 pb-6">
            <p className="text-primary text-sm font-bold tracking-wide uppercase mb-2 flex items-center gap-2 bg-primary/10 w-fit px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px]">spa</span>
              {currentDate}
            </p>
            <h1 className="text-text-main text-3xl md:text-4xl font-bold leading-[1.2] tracking-tight">
              How is your energy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pastel-blue-dark">unfolding</span> today?
            </h1>
          </div>

          {/* Metrics */}
          <div className="flex flex-col gap-5 px-6">
            {/* Physical Battery */}
            <div className="group glass-panel p-5 rounded-3xl transition-all duration-300 hover:shadow-md hover:border-primary/20 border border-transparent relative">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-text-muted text-xs font-bold uppercase tracking-wider opacity-70">Body</span>
                  <span className="text-text-main text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-pastel-blue-dark">battery_charging_80</span>
                    Physical Battery
                  </span>
                </div>
                <span className="text-pastel-blue-dark font-bold text-xl">{getEnergyLabel(responses.energy_level)}</span>
              </div>
              <div className="relative h-12 w-full rounded-2xl bg-stone-100 border border-stone-200 p-1 flex items-center shadow-inner cursor-pointer">
                <div className="absolute -right-[8px] top-1/2 -translate-y-1/2 w-1.5 h-4 bg-stone-300 rounded-r-md pointer-events-none"></div>
                <div
                  className="h-full bg-gradient-to-r from-pastel-blue/60 to-pastel-blue rounded-xl shadow-sm transition-all duration-500 relative overflow-hidden pointer-events-none"
                  style={{ width: `${responses.energy_level * 20}%` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/30 rounded-t-xl"></div>
                  <div className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="absolute top-3 right-8 w-1 h-1 bg-white/50 rounded-full"></div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={responses.energy_level}
                  onChange={(e) => handleResponse('energy_level', parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-10 opacity-0"
                  style={{ margin: 0 }}
                  aria-label="Physical Battery Level"
                />
              </div>
            </div>

            {/* Mental Clarity */}
            <div className="group glass-panel p-5 rounded-3xl transition-all duration-300 hover:shadow-md border border-transparent">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-text-muted text-xs font-bold uppercase tracking-wider opacity-70">Mind</span>
                  <span className="text-text-main text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-pastel-lavender">water_drop</span>
                    Mental Clarity
                  </span>
                </div>
                <span className="text-text-muted text-sm font-medium">{getClarityLabel(responses.mental_clarity)}</span>
              </div>
              <div className="relative h-10 flex items-center cursor-pointer">
                <div className="absolute inset-0 h-3 my-auto rounded-full bg-gradient-to-r from-stone-200 via-pastel-lavender to-pastel-blue-dark opacity-40 pointer-events-none"></div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={responses.mental_clarity}
                  onChange={(e) => handleResponse('mental_clarity', parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-20 opacity-0"
                  style={{ margin: 0 }}
                  aria-label="Mental Clarity Level"
                />
                <div
                  className="absolute -ml-3 flex flex-col items-center group-hover:scale-105 transition-transform pointer-events-none"
                  style={{ left: `${(responses.mental_clarity - 1) * 25}%` }}
                >
                  <div className="w-8 h-8 bg-white rounded-full border border-stone-100 shadow-md flex items-center justify-center">
                    <div className="w-3 h-3 bg-pastel-blue-dark rounded-full opacity-80"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted font-medium px-1">
                <span>Foggy</span>
                <span>Sharp</span>
              </div>
            </div>

            {/* Inner Weather */}
            <div className="group glass-panel p-5 rounded-3xl transition-all duration-300 hover:shadow-md border border-transparent">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-text-muted text-xs font-bold uppercase tracking-wider opacity-70">Emotion</span>
                  <span className="text-text-main text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-pastel-peach">wb_sunny</span>
                    Inner Weather
                  </span>
                </div>
                <span className="text-text-muted text-sm font-medium">{getWeatherLabel(responses.emotional_state)}</span>
              </div>
              <div className="relative w-full h-14 flex items-center justify-between gap-3 bg-stone-50 rounded-full px-2 border border-stone-100/50 shadow-soft-inner cursor-pointer">
                <span className="material-symbols-outlined text-stone-300 text-[20px] ml-2 pointer-events-none">cloud</span>
                <div className="relative flex-1 h-2 bg-stone-200 rounded-full overflow-hidden pointer-events-none">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-stone-300 via-pastel-peach to-pastel-yellow opacity-80 transition-all duration-300"
                    style={{ width: `${(responses.emotional_state - 1) * 25}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={responses.emotional_state}
                  onChange={(e) => handleResponse('emotional_state', parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-20 opacity-0"
                  style={{ margin: 0 }}
                  aria-label="Emotional State"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -ml-5 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-stone-50 pointer-events-none"
                  style={{ left: `${(responses.emotional_state - 1) * 25}%` }}
                >
                  <span className="material-symbols-outlined text-[20px] text-orange-300">sunny</span>
                </div>
                <span className="material-symbols-outlined text-orange-300 text-[20px] mr-2 pointer-events-none">sunny</span>
              </div>
            </div>

            {/* Pressure Valve */}
            <div className="group glass-panel p-5 rounded-3xl transition-all duration-300 hover:shadow-md border border-transparent">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-text-muted text-xs font-bold uppercase tracking-wider opacity-70">Stress</span>
                  <span className="text-text-main text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-pastel-sage">filter_vintage</span>
                    Pressure Valve
                  </span>
                </div>
                <span className="text-text-muted text-sm font-medium">{getStressLabel(responses.available_time)}</span>
              </div>
              <div className="relative pt-4 pb-2 px-1 cursor-pointer">
                <div className="h-3 w-full bg-gradient-to-r from-pastel-sage via-stone-200 to-pastel-rose rounded-full opacity-60 pointer-events-none"></div>
                <div className="flex justify-between mt-2 px-1 opacity-40 pointer-events-none">
                  <div className="w-px h-2 bg-text-main"></div>
                  <div className="w-px h-2 bg-text-main"></div>
                  <div className="w-px h-2 bg-text-main"></div>
                  <div className="w-px h-2 bg-text-main"></div>
                  <div className="w-px h-2 bg-text-main"></div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={responses.available_time}
                  onChange={(e) => handleResponse('available_time', parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-20 opacity-0"
                  style={{ margin: 0 }}
                  aria-label="Available Time"
                />
                <div
                  className="absolute top-2 -ml-3 w-7 h-7 bg-white border border-stone-100 rounded-full shadow-md flex items-center justify-center z-10 pointer-events-none"
                  style={{ left: `${(responses.available_time - 1) * 25}%` }}
                >
                  <div className="w-2.5 h-2.5 bg-pastel-sage rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted font-medium px-1">
                <span>Zen</span>
                <span>Overload</span>
              </div>
            </div>

            {/* Creative Spark */}
            <div className="group glass-panel p-5 rounded-3xl transition-all duration-300 hover:shadow-md border border-transparent">
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-text-muted text-xs font-bold uppercase tracking-wider opacity-70">Drive</span>
                  <span className="text-text-main text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-300">lightbulb</span>
                    Creative Spark
                  </span>
                </div>
                <span className="text-text-muted text-sm font-medium">{getSparkLabel(responses.environment_quality)}</span>
              </div>
              <div className="relative h-12 flex items-center cursor-pointer">
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden shadow-inner pointer-events-none">
                  <div
                    className="h-full bg-gradient-to-r from-stone-200 to-orange-300 opacity-70 transition-all duration-300"
                    style={{ width: `${responses.environment_quality * 20}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={responses.environment_quality}
                  onChange={(e) => handleResponse('environment_quality', parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-20 opacity-0"
                  style={{ margin: 0 }}
                  aria-label="Environment Quality"
                />
                <div
                  className="absolute -ml-6 w-12 h-12 bg-gradient-to-br from-orange-100 to-white rounded-full shadow-md flex items-center justify-center text-orange-400 border border-white pointer-events-none"
                  style={{ left: `${responses.environment_quality * 20}%` }}
                >
                  <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                </div>
              </div>
              <div className="flex justify-between mt-0 text-xs text-text-muted font-medium px-1">
                <span>Dull</span>
                <span>Blazing</span>
              </div>
            </div>
          </div>

          <div className="h-8"></div>
        </div>

        {/* Submit Button */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-bg-cream via-bg-cream/90 to-transparent pt-12 z-20 backdrop-blur-[2px]">
          <button
            onClick={submitCheckin}
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 rounded-2xl flex items-center justify-center gap-3 shadow-glow-soft group text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="text-lg font-bold tracking-wide">Log Check-In</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Results page (unchanged functionality)
  return (
    <div className="max-w-2xl mx-auto">
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
            <CheckSquare className="w-5 h-5" />
            Add some tasks
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={() => router.push('/dashboard')} className="text-text-muted hover:text-text-secondary">Back to dashboard</button>
      </div>

      {CelebrationComponent}
    </div>
  )
}
