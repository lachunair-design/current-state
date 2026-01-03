'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, CheckCircle, Circle, Sparkles } from 'lucide-react'
import { TIME_ESTIMATE_CONFIG, WORK_TYPE_CONFIG, ENERGY_LEVEL_CONFIG, TimeEstimate, WorkType, EnergyLevel } from '@/types/database'

interface Task {
  id: string
  title: string
  time_estimate: TimeEstimate
  work_type: WorkType
  energy_required: EnergyLevel
  priority: string
  goals?: {
    title: string
  }
}

interface PlanTomorrowModalProps {
  onClose: () => void
}

export function PlanTomorrowModal({ onClose }: PlanTomorrowModalProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()
    fetchExistingCommitments()
  }, [])

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .select('*, goals(*)')
      .eq('user_id', user.id)
      .in('status', ['active', 'deferred'])
      .order('created_at', { ascending: false })

    setTasks(data as Task[] || [])
    setLoading(false)
  }

  const fetchExistingCommitments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data } = await supabase
      .from('daily_commitments')
      .select('task_id')
      .eq('user_id', user.id)
      .eq('commitment_date', tomorrowStr)

    if (data) {
      setSelectedTaskIds(data.map((c: any) => c.task_id))
    }
  }

  const toggleTask = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId))
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get tomorrow's date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Delete all existing commitments for tomorrow
      await supabase
        .from('daily_commitments')
        .delete()
        .eq('user_id', user.id)
        .eq('commitment_date', tomorrowStr)

      // Create new commitments for selected tasks
      if (selectedTaskIds.length > 0) {
        const commitments = selectedTaskIds.map(taskId => ({
          user_id: user.id,
          task_id: taskId,
          commitment_date: tomorrowStr,
        }))

        await supabase
          .from('daily_commitments')
          .insert(commitments as never)
      }

      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error saving tomorrow plan:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Plan Tomorrow</h2>
              <p className="text-sm text-text-secondary">Select tasks you want to commit to tomorrow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted mb-2">No tasks in your queue</p>
              <button
                onClick={() => router.push('/tasks')}
                className="text-primary hover:underline font-semibold"
              >
                Add some tasks
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => {
                const isSelected = selectedTaskIds.includes(task.id)
                const timeConfig = TIME_ESTIMATE_CONFIG[task.time_estimate]
                const workConfig = WORK_TYPE_CONFIG[task.work_type]
                const energyConfig = ENERGY_LEVEL_CONFIG[task.energy_required]

                return (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-ocean-500 bg-ocean-50'
                        : 'border-surface-border hover:border-ocean-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-ocean-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary mb-1">{task.title}</p>
                        {task.goals && (
                          <p className="text-sm text-text-muted mb-2">
                            <span className="text-ocean-600">→</span> {task.goals.title}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-1 rounded-md ${energyConfig.color}`}>
                            {energyConfig.label}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-md bg-surface-hover text-text-secondary">
                            {workConfig.icon} {workConfig.label}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-md bg-surface-hover text-text-secondary">
                            ⏱️ {timeConfig.label}
                          </span>
                          {task.priority === 'must_do' && (
                            <span className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-800 font-semibold">
                              MUST DO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-border">
          <div className="mb-4 p-3 bg-ocean-50 rounded-lg border border-ocean-200">
            <p className="text-sm text-text-secondary">
              💡 <strong>Selected {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} for tomorrow.</strong>
              {selectedTaskIds.length > 5 && ' Consider if this is realistic for one day.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {saving ? 'Saving...' : `Save Plan (${selectedTaskIds.length} tasks)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
