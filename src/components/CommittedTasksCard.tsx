'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Sparkles, ArrowRight, Coffee } from 'lucide-react'
import { TIME_ESTIMATE_CONFIG, WORK_TYPE_CONFIG, TimeEstimate, WorkType } from '@/types/database'
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

interface Commitment {
  id: string
  task_id: string
  tasks: Task
}

interface CommittedTasksCardProps {
  commitments: Commitment[]
}

export function CommittedTasksCard({ commitments }: CommittedTasksCardProps) {
  const [completing, setCompleting] = useState<string | null>(null)
  const [abandoning, setAbandoning] = useState<string | null>(null)
  const [showWhatsNext, setShowWhatsNext] = useState(false)
  const [nextTask, setNextTask] = useState<Task | null>(null)
  const [completedTaskTitle, setCompletedTaskTitle] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()
  const { celebrate, CelebrationComponent } = useCelebration()

  const handleCompleteTask = async (commitmentId: string, task: Task) => {
    setCompleting(commitmentId)
    try {
      const now = new Date().toISOString()

      // Update task status
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: now
        } as never)
        .eq('id', task.id)

      // Update commitment
      await supabase
        .from('daily_commitments')
        .update({
          completed: true,
          completed_at: now
        } as never)
        .eq('id', commitmentId)

      celebrate(`You completed "${task.title}"! Amazing work! 🎉`)

      // Find the next task in commitments
      const currentIndex = commitments.findIndex(c => c.id === commitmentId)
      const next = commitments[currentIndex + 1]

      setCompletedTaskTitle(task.title)
      setNextTask(next?.tasks || null)

      // Show what's next modal after a short delay
      setTimeout(() => {
        setShowWhatsNext(true)
      }, 1500)
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setCompleting(null)
    }
  }

  const handleAbandonTask = async (commitmentId: string) => {
    setAbandoning(commitmentId)
    try {
      await supabase
        .from('daily_commitments')
        .update({
          abandoned: true,
          abandoned_reason: 'Removed from today\'s focus'
        } as never)
        .eq('id', commitmentId)

      router.refresh()
    } catch (error) {
      console.error('Error abandoning task:', error)
    } finally {
      setAbandoning(null)
    }
  }

  if (!commitments || commitments.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-6 animate-slide-in">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-text-primary">Today's Committed Focus</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            {commitments.length} {commitments.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <div className="space-y-3">
          {commitments.map(({ id, tasks: task }) => (
            <div
              key={id}
              className="bg-gradient-to-r from-primary/5 to-pastel-blue/5 border-2 border-primary/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary text-base leading-snug mb-1">
                    {task.title}
                  </h4>
                  {task.goals && (
                    <p className="text-xs text-text-muted font-medium">
                      <span className="text-primary">→</span> {task.goals.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-white px-2 py-1 rounded-md border border-surface-border">
                  <span>{WORK_TYPE_CONFIG[task.work_type as WorkType]?.icon || '📋'}</span>
                  <span>{WORK_TYPE_CONFIG[task.work_type as WorkType]?.label || 'Task'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-white px-2 py-1 rounded-md border border-surface-border">
                  <span>⏱️</span>
                  <span>{TIME_ESTIMATE_CONFIG[task.time_estimate as TimeEstimate]?.label || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCompleteTask(id, task)}
                  disabled={completing === id}
                  className="flex-1 py-2 bg-accent-green hover:bg-accent-green/90 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                >
                  {completing === id ? (
                    'Completing...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAbandonTask(id)}
                  disabled={abandoning === id}
                  className="px-3 py-2 bg-white border border-surface-border hover:bg-surface-hover text-text-secondary rounded-lg transition-all disabled:opacity-50"
                  title="Remove from today's focus"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 bg-ocean-50 border border-ocean-200 rounded-lg">
          <p className="text-xs text-text-secondary">
            💡 <strong>These are your committed tasks for today.</strong> Complete them to build momentum and track your progress.
          </p>
        </div>
      </div>

      {/* What's Next Modal */}
      {showWhatsNext && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Task Complete!
              </h3>
              <p className="text-sm text-text-secondary">
                Great work on completing "{completedTaskTitle}"
              </p>
            </div>

            {nextTask ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-text-primary mb-2">
                  What's next?
                </p>
                <div className="bg-white rounded-lg p-3 mb-3">
                  <p className="font-bold text-text-primary text-sm mb-1">
                    {nextTask.title}
                  </p>
                  {nextTask.goals && (
                    <p className="text-xs text-text-muted">
                      <span className="text-primary">→</span> {nextTask.goals.title}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowWhatsNext(false)
                    router.refresh()
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <span>Continue to next task</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-sunset-50 border border-sunset-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-text-primary mb-3">
                  🎯 All committed tasks complete!
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowWhatsNext(false)
                      router.push('/checkin')
                    }}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Check in for more tasks</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowWhatsNext(false)
                      router.refresh()
                    }}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Take a break</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowWhatsNext(false)
                router.refresh()
              }}
              className="text-sm text-text-muted hover:text-text-secondary w-full text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {CelebrationComponent}
    </>
  )
}
