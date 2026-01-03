'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Circle, AlertTriangle, Sparkles } from 'lucide-react'
import { GOAL_CATEGORY_CONFIG, GoalCategory } from '@/types/database'

interface Goal {
  id: string
  title: string
  category: GoalCategory
}

interface Task {
  id: string
  title: string
  goal_id: string | null
  goals?: {
    id: string
    title: string
  }
}

interface PlanningFormProps {
  goals: Goal[]
  tasks: Task[]
  existingPlan: any | null
  weekStart: string
  weekEnd: string
}

const CAPACITY_OPTIONS = [
  { value: 3, label: '3 tasks', description: 'Light week - focused on just the essentials' },
  { value: 5, label: '5 tasks', description: 'Realistic - sustainable pace' },
  { value: 8, label: '8 tasks', description: 'Busy - requires good energy and focus' },
  { value: 12, label: '12+ tasks', description: 'Very ambitious - risk of overload' },
]

export function PlanningForm({ goals, tasks, existingPlan, weekStart, weekEnd }: PlanningFormProps) {
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(
    existingPlan?.focus_goal_ids || []
  )
  const [capacity, setCapacity] = useState<number>(
    existingPlan?.estimated_capacity || 5
  )
  const [notes, setNotes] = useState<string>(existingPlan?.notes || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleGoal = (goalId: string) => {
    if (selectedGoalIds.includes(goalId)) {
      setSelectedGoalIds(selectedGoalIds.filter(id => id !== goalId))
    } else {
      setSelectedGoalIds([...selectedGoalIds, goalId])
    }
  }

  // Calculate task distribution
  const selectedGoalTasks = tasks.filter(task =>
    task.goal_id && selectedGoalIds.includes(task.goal_id)
  )
  const unlinkedTasks = tasks.filter(task => !task.goal_id)
  const relevantTasks = [...selectedGoalTasks, ...unlinkedTasks]
  const isOverloaded = relevantTasks.length > capacity

  const handleSave = async () => {
    console.log('Starting save...')
    setSaving(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('User:', user, 'Error:', userError)

      if (!user) {
        alert('You must be logged in to save a plan')
        setSaving(false)
        return
      }

      const planData = {
        user_id: user.id,
        week_start_date: weekStart,
        week_end_date: weekEnd,
        focus_goal_ids: selectedGoalIds,
        notes: notes || null,
        estimated_capacity: capacity,
      }

      console.log('Saving plan data:', planData)

      const { data, error } = await supabase
        .from('weekly_plans')
        .upsert(planData)
        .select()

      console.log('Save result - Data:', data, 'Error:', error)

      if (error) {
        console.error('Error saving weekly plan:', error)
        alert(`Error saving plan: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`)
        setSaving(false)
        return
      }

      console.log('Plan saved successfully, navigating to dashboard')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Caught error saving plan:', error)
      alert(`Failed to save plan: ${error?.message || 'Unknown error'}`)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Capacity Selection */}
      <div className="bg-white border border-surface-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          How much can you realistically do this week?
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Be honest about your time and energy. It's better to accomplish fewer tasks than to feel overwhelmed.
        </p>

        <div className="space-y-2">
          {CAPACITY_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setCapacity(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                capacity === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary">{option.label}</div>
                  <div className="text-sm text-text-secondary mt-0.5">{option.description}</div>
                </div>
                {capacity === option.value ? (
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Focus Selection */}
      <div className="bg-white border border-surface-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          Which goals will you focus on?
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Select 1-3 goals to prioritize this week. Fewer goals = better focus.
        </p>

        {goals.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p className="mb-2">No active goals yet</p>
            <button
              onClick={() => router.push('/goals')}
              className="text-primary hover:underline font-semibold"
            >
              Create your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map(goal => {
              const config = GOAL_CATEGORY_CONFIG[goal.category]
              const goalTasks = tasks.filter(t => t.goal_id === goal.id)
              const isSelected = selectedGoalIds.includes(goal.id)

              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{config.icon}</span>
                        <span className="font-bold text-text-primary">{goal.title}</span>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {goalTasks.length} {goalTasks.length === 1 ? 'task' : 'tasks'} in queue
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-muted flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {selectedGoalIds.length > 3 && (
          <div className="mt-3 p-3 bg-sunset-50 border border-sunset-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-sunset-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-sunset-800">
              <strong>Consider focusing on fewer goals.</strong> More than 3 goals can dilute your focus and make it harder to make meaningful progress.
            </p>
          </div>
        )}
      </div>

      {/* Capacity Check */}
      {selectedGoalIds.length > 0 && (
        <div className={`rounded-xl p-5 border-2 ${
          isOverloaded
            ? 'bg-sunset-50 border-sunset-300'
            : 'bg-ocean-50 border-ocean-300'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {isOverloaded ? (
                <AlertTriangle className="w-6 h-6 text-sunset-700" />
              ) : (
                <Sparkles className="w-6 h-6 text-ocean-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-text-primary mb-2">
                {isOverloaded ? 'Potential Overload Detected' : 'Looks Good!'}
              </h4>
              <p className="text-sm text-text-secondary mb-3">
                {isOverloaded ? (
                  <>
                    You have <strong>{relevantTasks.length} tasks</strong> related to your selected goals,
                    but your capacity is <strong>{capacity} tasks</strong>. Consider:
                  </>
                ) : (
                  <>
                    You have <strong>{relevantTasks.length} tasks</strong> for your selected goals,
                    which fits within your <strong>{capacity}-task capacity</strong>. Great planning!
                  </>
                )}
              </p>
              {isOverloaded && (
                <ul className="text-sm text-text-secondary space-y-1 ml-4">
                  <li>• Reducing the number of focus goals</li>
                  <li>• Increasing your weekly capacity estimate</li>
                  <li>• Archiving or deferring less important tasks</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white border border-surface-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          Weekly intention (optional)
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="What's your focus or theme for this week? (e.g., 'Finish client project', 'Rest and recharge', 'Push hard on launch')"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || selectedGoalIds.length === 0}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : existingPlan ? 'Update Plan' : 'Save Plan'}
        </button>
      </div>

      {selectedGoalIds.length === 0 && (
        <p className="text-center text-sm text-text-muted">
          Select at least one goal to save your plan
        </p>
      )}
    </div>
  )
}
