'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { 
  QUESTIONNAIRE_QUESTIONS, 
  Task,
  Goal,
  ENERGY_LEVEL_CONFIG,
  WORK_TYPE_CONFIG,
  TIME_ESTIMATE_CONFIG,
  PRIORITY_CONFIG
} from '@/types/database'
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

      await supabase.from('daily_responses').insert({
        user_id: user.id,
        energy_level: responses.energy_level,
        mental_clarity: responses.mental_clarity,
        emotional_state: responses.emotional_state,
        available_time: responses.available_time,
        environment_quality: responses.environment_quality,
      })

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, goals(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')

      const matched = matchTasks(tasks || [], responses)
      setMatchedTasks(matched)

      await supabase.from('profiles').update({ last_active_at: new Date().toISOString() } as any).eq('id', user.id)
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
      if (action === 'completed') {
        await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', taskId)
      } else {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        await supabase.from('tasks').update({ deferred_until: tomorrow.toISOString().split('T')[0] }).eq('id', taskId)
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
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">How are you right now?</h1>
          <p className="text-gray-600 mt-1">Quick check-in to find your perfect tasks</p>
        </div>

        <div className="flex gap-1 mb-8">
          {QUESTIONNAIRE_QUESTIONS.map((_, i) => (
            <div key={i} className={clsx('h-1 flex-1 rounded-full transition-colors',
              i < currentQuestion ? 'bg-primary-600' : i === currentQuestion ? 'bg-primary-400' : 'bg-gray-200'
            )} />
          ))}
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">{question.icon}</span>
            <h2 className="text-xl font-semibold text-gray-900">{question.question}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500 px-2">
              <span>{question.lowLabel}</span>
              <span>{question.highLabel}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={clsx('flex-1 py-4 rounded-xl text-lg font-semibold transition-all',
                    responses[question.id] === value
                      ? 'bg-primary-600 text-white scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {isLastQuestion && allAnswered && (
              <button onClick={submitCheckin} disabled={loading} className="btn-primary inline-flex items-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding tasks...</> : <>See my tasks <ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Question {currentQuestion + 1} of {QUESTIONNAIRE_QUESTIONS.length}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Here's what matches your state</h1>
        <p className="text-gray-600 mt-1">Based on your check-in, these tasks fit your current energy and time.</p>
      </div>

      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">
            {responses.energy_level <= 2 ? '😴' : responses.energy_level <= 4 ? '😊' : '⚡'}
          </div>
          <div>
            <div className="text-sm text-gray-500">Your current state</div>
            <div className="font-medium text-gray-900">
              {responses.energy_level <= 2 ? 'Low energy - taking it easy' :
               responses.energy_level <= 4 ? 'Good energy - ready to work' : 'High energy - lets go!'}
            </div>
          </div>
        </div>
        <button onClick={resetCheckin} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <RotateCcw className="w-4 h-4" /> Redo
        </button>
      </div>

      {matchedTasks.length > 0 ? (
        <div className="space-y-4">
          {matchedTasks.map(({ task, reasons }, index) => {
            const energyConfig = ENERGY_LEVEL_CONFIG[task.energy_required]
            const workTypeConfig = WORK_TYPE_CONFIG[task.work_type]
            const timeConfig = TIME_ESTIMATE_CONFIG[task.time_estimate]
            const priorityConfig = PRIORITY_CONFIG[task.priority]
            
            return (
              <div key={task.id} className={clsx('card p-6', index === 0 && 'ring-2 ring-primary-500 ring-offset-2')}>
                {index === 0 && <div className="text-xs font-medium text-primary-600 mb-2">TOP MATCH</div>}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                    {task.goals && <p className="text-sm text-gray-500 mt-1">Goal: {task.goals.title}</p>}
                  </div>
                  {task.estimated_value && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">${task.estimated_value}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${energyConfig.color}`}>{energyConfig.label}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{workTypeConfig.icon} {workTypeConfig.label}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">⏱️ {timeConfig.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityConfig.color}`}>{priorityConfig.label}</span>
                </div>

                {reasons.length > 0 && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Why this task: </span>{reasons.join(' • ')}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => handleTaskAction(task.id, 'completed')} disabled={submitting === task.id} className="btn-primary flex-1">
                    {submitting === task.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mark Complete'}
                  </button>
                  <button onClick={() => handleTaskAction(task.id, 'deferred')} disabled={submitting === task.id} className="btn-secondary">
                    Not today
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="font-semibold text-gray-900 mb-2">No tasks right now!</h3>
          <p className="text-gray-600 mb-4">You're all caught up, or you haven't added tasks yet.</p>
          <button onClick={() => router.push('/tasks')} className="btn-primary">Add some tasks</button>
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-700">Back to dashboard</button>
      </div>
    </div>
  )
}
