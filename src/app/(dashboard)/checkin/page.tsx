'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, RotateCcw, Clock, Timer, Calendar, CheckSquare } from 'lucide-react'
import {
  QUESTIONNAIRE_QUESTIONS,
  Task,
  Goal,
  ENERGY_LEVEL_CONFIG,
  WORK_TYPE_CONFIG,
  TIME_ESTIMATE_CONFIG,
  PRIORITY_CONFIG,
  Database
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

export default function CheckinPage() {
  const [step, setStep] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [matchedTasks, setMatchedTasks] = useState<MatchedTask[]>([])
  const [submitting, setSubmitting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  const question = QUESTIONNAIRE_QUESTIONS[currentQuestion]
  const isLastQuestion = currentQuestion === QUESTIONNAIRE_QUESTIONS.length - 1
  const allAnswered = Object.keys(responses).length === QUESTIONNAIRE_QUESTIONS.length

  const handleResponse = (value: number) => {
    setResponses({ ...responses, [question.id]: value })
    if (!isLastQuestion) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 150)
    }
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

      // Type assertion needed due to Supabase type inference issue
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

      // Type assertion needed due to Supabase type inference issue
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

        // Celebrate completion!
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
    setCurrentQuestion(0)
    setResponses({})
    setMatchedTasks([])
  }

  if (step === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-accent-green" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">How are you right now?</h1>
          <p className="text-lg text-text-secondary">Quick check-in to find your perfect tasks</p>
        </div>

        <div className="flex gap-2 mb-8 px-4">
          {QUESTIONNAIRE_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={clsx('h-2 flex-1 rounded-full transition-all duration-300',
                i < currentQuestion ? 'bg-accent-green' :
                i === currentQuestion ? 'bg-accent-green/60 scale-110' :
                'bg-dark-border'
              )}
            />
          ))}
        </div>

        <div className="card p-8 md:p-10 shadow-lg animate-scale-in">
          <div className="text-center mb-10">
            <span className="text-6xl mb-6 block animate-scale-in">{question.icon}</span>
            <h2 className="text-2xl font-bold text-text-primary leading-tight">{question.question}</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between text-sm font-medium text-text-muted px-2">
              <span>{question.lowLabel}</span>
              <span>{question.highLabel}</span>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={clsx('flex-1 py-5 rounded-2xl text-xl font-bold transition-all duration-200 shadow-sm',
                    responses[question.id] === value
                      ? 'bg-accent-green text-black scale-110 shadow-lg shadow-accent-green/20'
                      : 'bg-dark-card text-text-secondary hover:bg-dark-hover hover:scale-105 hover:shadow-md'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-10 pt-6 border-t border-dark-border">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn-secondary inline-flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {isLastQuestion && allAnswered && (
              <button
                onClick={submitCheckin}
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding tasks...
                  </>
                ) : (
                  <>
                    See my tasks
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm font-medium text-text-muted mt-6">
          Question {currentQuestion + 1} of {QUESTIONNAIRE_QUESTIONS.length}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br bg-accent-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-8 h-8 text-accent-green" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Here's what matches your state</h1>
        <p className="text-lg text-text-secondary">The app chose these for you—no decisions needed.</p>
      </div>

      {/* Mental Model Explainer */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
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
          className="text-sm text-text-muted hover:text-text-secondary flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-hover transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Redo
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
                    <div className="text-xs font-bold text-accent-green bg-primary-100 px-3 py-1 rounded-full uppercase tracking-wide">
                      ⭐ Top Match
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary text-xl mb-1">{task.title}</h3>
                    {task.goals && (
                      <p className="text-sm text-text-muted font-medium">
                        <span className="text-accent-green">→</span> {task.goals.title}
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
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-dark-hover text-text-secondary">
                    {workTypeConfig.icon} {workTypeConfig.label}
                  </span>
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-dark-hover text-text-secondary">
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
                  {/* Low energy: Single "Skip" button to reduce decision fatigue */}
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
                    /* Medium/High energy: Show both options */
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

      {/* Focus Work Suggestions */}
      {matchedTasks.length > 0 && (
        <div className="mt-8 card p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Timer className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Focus Work Suggestions</h3>
              <p className="text-sm text-text-secondary mt-0.5">Based on your available time and energy</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Pomodoro Suggestion */}
            <div className="bg-dark-card rounded-lg p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h4 className="font-medium text-text-primary">Pomodoro Technique</h4>
              </div>
              {responses.available_time <= 2 ? (
                <p className="text-sm text-text-secondary">
                  <strong>Quick sprint:</strong> Try 1-2 Pomodoros (25 min work, 5 min break)
                </p>
              ) : responses.available_time <= 4 ? (
                <p className="text-sm text-text-secondary">
                  <strong>Standard session:</strong> 3-4 Pomodoros with breaks (2 hours total)
                </p>
              ) : (
                <p className="text-sm text-text-secondary">
                  <strong>Deep work session:</strong> 4-6 Pomodoros with longer breaks (3-4 hours)
                </p>
              )}
            </div>

            {/* Time Blocking Suggestion */}
            <div className="bg-dark-card rounded-lg p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h4 className="font-medium text-text-primary">Time Blocking</h4>
              </div>
              {responses.mental_clarity >= 4 ? (
                <p className="text-sm text-text-secondary">
                  <strong>High clarity:</strong> Start with your hardest task while sharp
                </p>
              ) : responses.mental_clarity >= 3 ? (
                <p className="text-sm text-text-secondary">
                  <strong>Medium clarity:</strong> Tackle medium-effort tasks first
                </p>
              ) : (
                <p className="text-sm text-text-secondary">
                  <strong>Low clarity:</strong> Start with quick wins to build momentum
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-text-muted text-center">
            💡 Tip: Turn off notifications and set a timer to stay focused
          </div>
        </div>
      )}

      {/* Manual Override for High Energy */}
      {responses.energy_level >= 4 && (
        <div className="mt-8 card p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Feeling ambitious?</h3>
              <p className="text-sm text-text-secondary mb-3">
                You have high energy today. If none of these tasks feel right, you can browse your full task list and pick something yourself.
              </p>
              <button
                onClick={() => router.push('/tasks')}
                className="text-sm text-purple-700 hover:text-purple-900 font-medium underline"
              >
                Browse all tasks →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={() => router.push('/dashboard')} className="text-text-muted hover:text-text-secondary">Back to dashboard</button>
      </div>

      {/* Celebration Component */}
      {CelebrationComponent}
    </div>
  )
}
