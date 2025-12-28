'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, ArrowRight, ArrowLeft, Check, Loader2, Plus, X } from 'lucide-react'
import { GoalCategory, GOAL_CATEGORY_CONFIG, CreateGoalInput } from '@/types/database'
import clsx from 'clsx'

const STEPS = [
  { id: 1, title: 'Welcome' },
  { id: 2, title: 'Set Goals' },
  { id: 3, title: 'All Set' },
]

interface GoalDraft extends CreateGoalInput {
  id: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState<GoalDraft[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Goal form state
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('career')
  const [goalDescription, setGoalDescription] = useState('')
  const [incomeStream, setIncomeStream] = useState('')

  const addGoal = () => {
    if (!goalTitle.trim()) return

    const newGoal: GoalDraft = {
      id: crypto.randomUUID(),
      title: goalTitle.trim(),
      category: goalCategory,
      description: goalDescription.trim() || undefined,
      income_stream_name: incomeStream.trim() || undefined,
      display_order: goals.length,
    }

    setGoals([...goals, newGoal])
    resetGoalForm()
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const resetGoalForm = () => {
    setGoalTitle('')
    setGoalCategory('career')
    setGoalDescription('')
    setIncomeStream('')
    setShowGoalForm(false)
  }

  const completeOnboarding = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert goals
      if (goals.length > 0) {
        const goalsToInsert = goals.map(({ id, ...goal }) => ({
          ...goal,
          user_id: user.id,
        }))

        const { error: goalsError } = await supabase
          .from('goals')
          .insert(goalsToInsert as never[])

        if (goalsError) throw goalsError
      }

      // Mark onboarding complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: 3,
        } as never)
        .eq('id', user.id)

      if (profileError) throw profileError

      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-xl text-gray-900">Current State</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step >= s.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              )}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx(
                  'w-12 h-1 mx-2',
                  step > s.id ? 'bg-primary-600' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="card p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Let's set up your workspace
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Current State works by matching tasks to your energy. 
                First, let's define what you're working toward.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-medium text-gray-900 mb-3">How this works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">1.</span>
                    Set 3-5 goals across your life domains
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">2.</span>
                    Add tasks linked to each goal
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">3.</span>
                    Check in daily (30 seconds) to get matched tasks
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="btn-primary inline-flex items-center gap-2"
              >
                Let's go <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  What are you working toward?
                </h1>
                <p className="text-gray-600">
                  Add 3-5 goals across different areas of your life.
                  You can always add more later.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              {/* Goals list */}
              <div className="space-y-3 mb-6">
                {goals.map((goal) => {
                  const config = GOAL_CATEGORY_CONFIG[goal.category]
                  return (
                    <div key={goal.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        <span>{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{goal.title}</h4>
                        <p className="text-sm text-gray-500">{config.label}</p>
                      </div>
                      {goal.income_stream_name && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hidden sm:block">
                          💰 {goal.income_stream_name}
                        </span>
                      )}
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Add goal form */}
              {showGoalForm ? (
                <div className="border border-gray-200 rounded-xl p-4 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="label">Goal title</label>
                      <input
                        type="text"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        className="input"
                        placeholder="e.g., Land a new job, Launch my business"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="label">Category</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {(Object.keys(GOAL_CATEGORY_CONFIG) as GoalCategory[]).map((cat) => {
                          const config = GOAL_CATEGORY_CONFIG[cat]
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setGoalCategory(cat)}
                              className={clsx(
                                'p-2 rounded-lg border text-center transition-all',
                                goalCategory === cat
                                  ? `${config.color} border-current`
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              <span className="text-xl">{config.icon}</span>
                              <span className="block text-xs mt-1">{config.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="label">Why does this matter? (optional)</label>
                      <input
                        type="text"
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        className="input"
                        placeholder="e.g., Financial freedom, career growth"
                      />
                    </div>

                    <div>
                      <label className="label">Income stream name (optional)</label>
                      <input
                        type="text"
                        value={incomeStream}
                        onChange={(e) => setIncomeStream(e.target.value)}
                        className="input"
                        placeholder="e.g., Freelance clients, GUTSY, Consulting"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add this if this goal is tied to making money
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addGoal}
                        disabled={!goalTitle.trim()}
                        className="btn-primary flex-1"
                      >
                        Add Goal
                      </button>
                      <button
                        type="button"
                        onClick={resetGoalForm}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add a goal
                </button>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {goals.length === 0 ? 'Skip for now' : 'Continue'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                {goals.length === 0 
                  ? "You can add goals later from your dashboard"
                  : `${goals.length} goal${goals.length === 1 ? '' : 's'} added`}
              </p>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                You're all set!
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {goals.length > 0 
                  ? `Great! You've set ${goals.length} goal${goals.length === 1 ? '' : 's'}. Now add some tasks and do your first check-in.`
                  : "Your workspace is ready. Start by adding goals and tasks, then check in to get matched work."}
              </p>

              <div className="bg-primary-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-medium text-gray-900 mb-3">Next steps:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-600" />
                    Add tasks to your goals
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-600" />
                    Do your first check-in (30 seconds)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-600" />
                    Work on matched tasks
                  </li>
                </ul>
              </div>

              <button 
                onClick={goToDashboard}
                className="btn-primary inline-flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
